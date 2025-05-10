import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri =
	process.env.DB_URI ||
	"mongodb+srv://your_username:your_password@cluster0.mongodb.net/smartagroconnect";
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: "Unauthorized access" });
	}
	const token = authHeader.split(" ")[1];
	jwt.verify(
		token,
		process.env.JWT_SECRET || "smartagroconnect_jwt_super_secret_key",
		(err, decoded) => {
			if (err) {
				return res.status(403).send({ message: "Forbidden access" });
			}
			req.decoded = decoded;
			next();
		}
	);
};

// Role-based middleware
const verifyRole = (roles) => {
	return (req, res, next) => {
		const userRole = req.decoded.role;
		if (!roles.includes(userRole)) {
			return res.status(403).send({ message: "Forbidden access" });
		}
		next();
	};
};

async function run() {
	try {
		await client.connect();
		console.log("Connected to MongoDB");

		// Database Collections
		const database = client.db("smartagroconnect");
		const usersCollection = database.collection("users");
		const agentsCollection = database.collection("agents");
		const productsCollection = database.collection("products");
		const ordersCollection = database.collection("orders");
		const reviewsCollection = database.collection("reviews");
		const regionsCollection = database.collection("regions");

		// Authentication API
		app.post("/jwt", async (req, res) => {
			const user = req.body;
			const token = jwt.sign(
				user,
				process.env.JWT_SECRET || "smartagroconnect_jwt_super_secret_key",
				{ expiresIn: "1d" }
			);
			res.send({ token });
		});

		// User APIs
		app.post("/users", async (req, res) => {
			const user = req.body;
			// Check if user already exists
			const existingUser = await usersCollection.findOne({ email: user.email });
			if (existingUser) {
				return res.send({
					message: "User already exists",
					userId: existingUser._id,
				});
			}
			// Hash password if exists
			if (user.password) {
				const hashedPassword = await bcrypt.hash(user.password, 10);
				user.password = hashedPassword;
			}
			user.createdAt = new Date();
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		app.get("/users", verifyJWT, verifyRole(["admin"]), async (req, res) => {
			const users = await usersCollection.find().toArray();
			res.send(users);
		});

		app.get("/users/:email", verifyJWT, async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			if (!user) {
				return res.status(404).send({ message: "User not found" });
			}
			res.send(user);
		});

		// Agent APIs
		app.post("/agents/apply", verifyJWT, async (req, res) => {
			const application = req.body;
			application.status = "pending";
			application.createdAt = new Date();
			const result = await agentsCollection.insertOne(application);
			res.send(result);
		});

		app.get(
			"/agents/applications",
			verifyJWT,
			verifyRole(["admin"]),
			async (req, res) => {
				const applications = await agentsCollection
					.find({ status: "pending" })
					.toArray();
				res.send(applications);
			}
		);

		app.patch(
			"/agents/applications/:id",
			verifyJWT,
			verifyRole(["admin"]),
			async (req, res) => {
				const id = req.params.id;
				const { status } = req.body;
				const filter = { _id: new ObjectId(id) };
				const updateDoc = {
					$set: { status },
				};
				const result = await agentsCollection.updateOne(filter, updateDoc);

				// If approved, update user role
				if (status === "approved") {
					const agent = await agentsCollection.findOne(filter);
					await usersCollection.updateOne(
						{ email: agent.email },
						{ $set: { role: "agent", region: agent.region } }
					);
				}

				res.send(result);
			}
		);

		// Products APIs
		app.post(
			"/products",
			verifyJWT,
			verifyRole(["seller"]),
			async (req, res) => {
				const product = req.body;
				product.status = "pending";
				product.createdAt = new Date();
				const result = await productsCollection.insertOne(product);
				res.send(result);
			}
		);

		app.get("/products", async (req, res) => {
			const { cropType, region, minPrice, maxPrice } = req.query;

			let query = { status: "approved" };

			if (cropType) query.cropType = cropType;
			if (region) query.region = region;

			if (minPrice || maxPrice) {
				query.price = {};
				if (minPrice) query.price.$gte = parseFloat(minPrice);
				if (maxPrice) query.price.$lte = parseFloat(maxPrice);
			}

			const products = await productsCollection.find(query).toArray();
			res.send(products);
		});

		app.get("/products/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const product = await productsCollection.findOne(query);
			res.send(product);
		});

		app.get(
			"/products/approval/:agentRegion",
			verifyJWT,
			verifyRole(["agent"]),
			async (req, res) => {
				const agentRegion = req.params.agentRegion;
				const pendingProducts = await productsCollection
					.find({
						region: agentRegion,
						status: "pending",
					})
					.toArray();
				res.send(pendingProducts);
			}
		);

		app.patch(
			"/products/:id/approve",
			verifyJWT,
			verifyRole(["agent"]),
			async (req, res) => {
				const id = req.params.id;
				const filter = { _id: new ObjectId(id) };
				const updateDoc = {
					$set: { status: "approved" },
				};
				const result = await productsCollection.updateOne(filter, updateDoc);
				res.send(result);
			}
		);

		// Orders APIs
		app.post(
			"/orders",
			verifyJWT,
			verifyRole(["consumer"]),
			async (req, res) => {
				const order = req.body;
				order.status = "pending";
				order.createdAt = new Date();
				const result = await ordersCollection.insertOne(order);
				res.send(result);
			}
		);

		app.get("/orders", verifyJWT, async (req, res) => {
			const email = req.decoded.email;
			const role = req.decoded.role;

			let query = {};

			if (role === "seller") {
				query.sellerEmail = email;
			} else if (role === "consumer") {
				query.buyerEmail = email;
			} else if (role === "agent") {
				const user = await usersCollection.findOne({ email });
				query.$or = [
					{ sellerRegion: user.region },
					{ buyerRegion: user.region },
				];
			}

			const orders = await ordersCollection.find(query).toArray();
			res.send(orders);
		});

		app.patch("/orders/:id/status", verifyJWT, async (req, res) => {
			const id = req.params.id;
			const { status } = req.body;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: { status, updatedAt: new Date() },
			};
			const result = await ordersCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		// Review APIs
		app.post(
			"/reviews",
			verifyJWT,
			verifyRole(["consumer"]),
			async (req, res) => {
				const review = req.body;
				review.createdAt = new Date();
				const result = await reviewsCollection.insertOne(review);
				res.send(result);
			}
		);

		app.get("/reviews/:productId", async (req, res) => {
			const productId = req.params.productId;
			const reviews = await reviewsCollection.find({ productId }).toArray();
			res.send(reviews);
		});

		// Region APIs
		app.get("/regions", async (req, res) => {
			const regions = await regionsCollection.find().toArray();
			res.send(regions);
		});

		app.post("/regions", verifyJWT, verifyRole(["admin"]), async (req, res) => {
			const region = req.body;
			const result = await regionsCollection.insertOne(region);
			res.send(result);
		});

		// Root API
		app.get("/", (req, res) => {
			res.send("SmartAgro Connect Server is running");
		});
	} finally {
		// Ensure that app.listen is inside the try/finally block
		app.listen(port, () => {
			console.log(`SmartAgro Connect server running on port ${port}`);
		});
	}
}

run().catch(console.dir);
