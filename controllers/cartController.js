import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper function to format cart response
const formatCartResponse = (cart) => ({
	items: cart.items.map((item) => ({
		_id: item.productId,
		title: item.title,
		price: item.price,
		quantity: item.quantity,
		unit: item.unit,
		image: item.image,
		minimumOrderQuantity: item.minimumOrderQuantity,
		seller: {
			sellerId: item.seller.sellerId,
			name: item.seller.name,
		},
	})),
	totalItems: cart.totalItems,
	subtotal: cart.subtotal,
	deliveryCharge: cart.deliveryCharge,
	totalAmount: cart.totalAmount,
});

// Helper function to verify user access
const verifyUserAccess = (req, email) => {
	return req.decoded.email === email || req.decoded.role === "admin";
};

// 1. GET /api/cart/:email - Load User Cart
export const getUserCart = async (req, res) => {
	try {
		const { email } = req.params;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only access your own cart.",
			});
		}

		let cart = await Cart.findOne({ userEmail: email });

		// If cart doesn't exist, create an empty one
		if (!cart) {
			cart = new Cart({
				userEmail: email,
				userId: req.decoded.id,
				items: [],
				totalItems: 0,
				subtotal: 0,
				deliveryCharge: 0,
				totalAmount: 0,
			});
			await cart.save();
		}

		res.status(200).json({
			success: true,
			cart: formatCartResponse(cart),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 2. POST /api/cart/add - Add Single Item to Cart
export const addSingleItem = async (req, res) => {
	try {
		const { email, productId, quantity = 1 } = req.body;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only add to your own cart.",
			});
		}

		// Validate required fields
		if (!email || !productId) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Email and productId are required",
			});
		}

		// Get product details
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Product not found",
			});
		}

		// Check if product is approved
		if (product.status !== "approved") {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Product is not available for purchase",
			});
		}

		// Validate quantity
		if (quantity < product.minimumOrderQuantity) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: `Minimum order quantity is ${product.minimumOrderQuantity}`,
			});
		}

		// Find or create cart
		let cart = await Cart.findOne({ userEmail: email });

		if (!cart) {
			cart = new Cart({
				userEmail: email,
				userId: req.decoded.id,
				items: [],
				deliveryCharge: 300, // Default delivery charge
			});
		}

		// Check if item already exists in cart
		const existingItemIndex = cart.items.findIndex(
			(item) => item.productId === productId
		);

		if (existingItemIndex !== -1) {
			// Update existing item quantity (merge)
			cart.items[existingItemIndex].quantity += quantity;
		} else {
			// Add new item to cart
			const newItem = {
				productId: product._id.toString(),
				title: product.title,
				price: product.pricePerUnit,
				unit: product.unit,
				quantity: quantity,
				minimumOrderQuantity: product.minimumOrderQuantity,
				image: product.images?.[0] || "",
				seller: {
					sellerId: product.sellerInfo._id.toString(),
					name: product.sellerInfo.name,
				},
				addedAt: new Date(),
			};
			cart.items.push(newItem);
		}

		await cart.save();

		res.status(200).json({
			success: true,
			message: "Item added to cart",
			cart: formatCartResponse(cart),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 3. POST /api/cart/add-multiple - Add Multiple Items to Cart
export const addMultipleItems = async (req, res) => {
	try {
		const { email, items } = req.body;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only add to your own cart.",
			});
		}

		// Validate required fields
		if (!email || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Email and items array are required",
			});
		}

		// Find or create cart
		let cart = await Cart.findOne({ userEmail: email });

		if (!cart) {
			cart = new Cart({
				userEmail: email,
				userId: req.decoded.id,
				items: [],
				deliveryCharge: 300, // Default delivery charge
			});
		}

		let addedItems = 0;
		let mergedItems = 0;

		// Process each item
		for (const item of items) {
			const {
				productId,
				quantity,
				title,
				price,
				unit,
				image,
				minimumOrderQuantity,
				seller,
			} = item;

			// Check if item already exists in cart
			const existingItemIndex = cart.items.findIndex(
				(cartItem) => cartItem.productId === productId
			);

			if (existingItemIndex !== -1) {
				// Update existing item quantity (merge)
				cart.items[existingItemIndex].quantity += quantity;
				mergedItems++;
			} else {
				// Add new item to cart
				const newItem = {
					productId: productId,
					title: title,
					price: price,
					unit: unit,
					quantity: quantity,
					minimumOrderQuantity: minimumOrderQuantity || 1,
					image: image || "",
					seller: {
						sellerId: seller?.sellerId || "",
						name: seller?.name || "",
					},
					addedAt: new Date(),
				};
				cart.items.push(newItem);
				addedItems++;
			}
		}

		await cart.save();

		res.status(200).json({
			success: true,
			message: "Items added to cart",
			cart: formatCartResponse(cart),
			addedItems,
			mergedItems,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 4. PUT /api/cart/update - Update Item Quantity
export const updateCartItem = async (req, res) => {
	try {
		const { email, productId, quantity } = req.body;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only update your own cart.",
			});
		}

		// Validate required fields
		if (!email || !productId || !quantity) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Email, productId, and quantity are required",
			});
		}

		// Validate quantity
		if (quantity < 1) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Quantity must be at least 1",
			});
		}

		const cart = await Cart.findOne({ userEmail: email });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Cart not found",
			});
		}

		// Find the item to update
		const itemIndex = cart.items.findIndex(
			(item) => item.productId === productId
		);

		if (itemIndex === -1) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Item not found in cart",
			});
		}

		// Verify minimum order quantity
		const item = cart.items[itemIndex];
		if (quantity < item.minimumOrderQuantity) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: `Minimum order quantity is ${item.minimumOrderQuantity}`,
			});
		}

		// Update quantity
		cart.items[itemIndex].quantity = quantity;
		await cart.save();

		res.status(200).json({
			success: true,
			message: "Cart updated",
			cart: formatCartResponse(cart),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 5. DELETE /api/cart/remove - Remove Item from Cart
export const removeCartItem = async (req, res) => {
	try {
		const { email, productId } = req.body;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only modify your own cart.",
			});
		}

		// Validate required fields
		if (!email || !productId) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Email and productId are required",
			});
		}

		const cart = await Cart.findOne({ userEmail: email });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Cart not found",
			});
		}

		// Find and remove the item
		const itemIndex = cart.items.findIndex(
			(item) => item.productId === productId
		);

		if (itemIndex === -1) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Item not found in cart",
			});
		}

		cart.items.splice(itemIndex, 1);
		await cart.save();

		res.status(200).json({
			success: true,
			message: "Item removed from cart",
			cart: formatCartResponse(cart),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 6. DELETE /api/cart/clear/:email - Clear Entire Cart
export const clearCart = async (req, res) => {
	try {
		const { email } = req.params;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only clear your own cart.",
			});
		}

		const cart = await Cart.findOne({ userEmail: email });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Cart not found",
			});
		}

		// Clear all items
		cart.items = [];
		cart.deliveryCharge = 0;
		await cart.save();

		res.status(200).json({
			success: true,
			message: "Cart cleared",
			cart: formatCartResponse(cart),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 7. POST /api/cart/batch-update - Batch Update Cart Items
export const batchUpdateCart = async (req, res) => {
	try {
		const { email, operations } = req.body;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only update your own cart.",
			});
		}

		// Validate required fields
		if (!email || !Array.isArray(operations) || operations.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Email and operations array are required",
			});
		}

		const cart = await Cart.findOne({ userEmail: email });

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Cart/Item not found",
				error: "Cart not found",
			});
		}

		let operationsProcessed = 0;

		// Process each operation
		for (const operation of operations) {
			const { itemId, type, quantity } = operation;

			if (!itemId || !type) {
				continue; // Skip invalid operations
			}

			const itemIndex = cart.items.findIndex(
				(item) => item.productId === itemId
			);

			if (itemIndex === -1) {
				continue; // Skip if item not found
			}

			if (type === "update" && quantity && quantity > 0) {
				// Verify minimum order quantity
				const item = cart.items[itemIndex];
				if (quantity >= item.minimumOrderQuantity) {
					cart.items[itemIndex].quantity = quantity;
					operationsProcessed++;
				}
			} else if (type === "remove") {
				cart.items.splice(itemIndex, 1);
				operationsProcessed++;
			}
		}

		await cart.save();

		res.status(200).json({
			success: true,
			message: "Cart updated successfully",
			cart: formatCartResponse(cart),
			operationsProcessed,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

// 8. POST /api/cart/preview-merge - Preview Cart Merge (Optional)
export const previewCartMerge = async (req, res) => {
	try {
		const { email, newItems } = req.body;

		// Verify user access
		if (!verifyUserAccess(req, email)) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
				error: "Access denied. You can only preview your own cart.",
			});
		}

		// Validate required fields
		if (!email || !Array.isArray(newItems)) {
			return res.status(400).json({
				success: false,
				message: "Bad request/Invalid data",
				error: "Email and newItems array are required",
			});
		}

		const cart = await Cart.findOne({ userEmail: email });
		const currentItems = cart ? cart.items.length : 0;

		let mergedItems = 0;
		let totalQuantityIncrease = 0;

		// Calculate merge preview
		if (cart) {
			for (const newItem of newItems) {
				const existingItem = cart.items.find(
					(item) => item.productId === newItem.productId
				);

				if (existingItem) {
					mergedItems++;
					totalQuantityIncrease += newItem.quantity;
				} else {
					totalQuantityIncrease += newItem.quantity;
				}
			}
		} else {
			totalQuantityIncrease = newItems.reduce(
				(total, item) => total + item.quantity,
				0
			);
		}

		const finalItems = currentItems + newItems.length - mergedItems;

		res.status(200).json({
			success: true,
			preview: {
				currentItems,
				newItems: newItems.length,
				finalItems,
				mergedItems,
				totalQuantityIncrease,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};
