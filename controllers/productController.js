import Product from "../models/Product.js";
import User from "../models/User.js";

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { sellerInfo } = req.body;

    // Check if seller is verified
    const seller = await User.findById(sellerInfo?._id).exec();

    if (!seller) {
      return res.status(403).json({
        success: false,
        message: "User data not found",
      });
    } else if (!seller?.verified) {
      return res.status(403).json({
        success: false,
        message: "Seller is not verified",
      });
    }

    const newProduct = new Product({
      ...req.body,
      quality: "D",
      approvedBy: { agentId: null, approvedAt: null },
      averageRating: 0,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all approved products
export const getAllProducts = async (req, res) => {
  try {
    const {
      cropType,
      region,
      district,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { status: "approved" };

    if (cropType) query.cropType = cropType;
    if (region) query["sellerInfo.operationalArea.region"] = region;
    if (district) query["sellerInfo.operationalArea.district"] = district;

    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
    }

    const maxPriceResult = await Product.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, maxPrice: { $max: "$pricePerUnit" } } },
    ]);

    const existingMaxPrice =
      maxPriceResult.length > 0 ? maxPriceResult[0].maxPrice : 0;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const products = await Product.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalProducts: total,
      maxPrice: existingMaxPrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const {
      cropType,
      region,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { status: "approved" };

    if (cropType) query.cropType = cropType;
    if (region) query["sellerInfo.operationalArea.region"] = region;

    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const products = await Product.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Seller Products
export const getProductsBySeller = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Missing seller email in URL",
    });
  }
  try {
    const products = await Product.find({ 'sellerInfo.email': email }).lean();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get crop types
export const getCropTypes = async (req, res) => {
  try {
    const cropTypes = await Product.distinct("cropType", {
      cropType: { $ne: null },
    });
    cropTypes.sort();

    res.status(200).json({
      success: true,
      data: cropTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Agent approves product
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.decoded.id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const agent = await User.findById(agentId);
    if (agent.region !== product.sellerInfo.operationalArea.region) {
      return res.status(403).json({
        success: false,
        message: "Agent can only approve products from their assigned region",
      });
    }

    product.status = "approved";
    product.approvedBy = {
      agentId,
      approvedAt: new Date(),
    };

    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.decoded.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (
      product.sellerInfo._id.toString() !== userId &&
      req.decoded.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
