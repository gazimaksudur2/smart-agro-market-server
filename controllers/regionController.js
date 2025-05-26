// Static data for Bangladesh regions and districts
const regionsData = [
	{
		name: "Dhaka",
		districts: [
			{ name: "Dhaka" },
			{ name: "Gazipur" },
			{ name: "Narayanganj" },
			{ name: "Tangail" },
			{ name: "Kishoreganj" },
			{ name: "Manikganj" },
			{ name: "Munshiganj" },
			{ name: "Narsingdi" },
			{ name: "Rajbari" },
			{ name: "Shariatpur" },
			{ name: "Faridpur" },
			{ name: "Gopalganj" },
			{ name: "Madaripur" },
		],
	},
	{
		name: "Chittagong",
		districts: [
			{ name: "Chittagong" },
			{ name: "Cox's Bazar" },
			{ name: "Rangamati" },
			{ name: "Bandarban" },
			{ name: "Khagrachhari" },
			{ name: "Feni" },
			{ name: "Lakshmipur" },
			{ name: "Comilla" },
			{ name: "Noakhali" },
			{ name: "Brahmanbaria" },
			{ name: "Chandpur" },
		],
	},
	{
		name: "Rajshahi",
		districts: [
			{ name: "Rajshahi" },
			{ name: "Chapainawabganj" },
			{ name: "Natore" },
			{ name: "Naogaon" },
			{ name: "Pabna" },
			{ name: "Bogura" },
			{ name: "Joypurhat" },
			{ name: "Sirajganj" },
		],
	},
	{
		name: "Khulna",
		districts: [
			{ name: "Khulna" },
			{ name: "Satkhira" },
			{ name: "Jessore" },
			{ name: "Narail" },
			{ name: "Bagerhat" },
			{ name: "Jhenaidah" },
			{ name: "Magura" },
			{ name: "Kushtia" },
			{ name: "Chuadanga" },
			{ name: "Meherpur" },
		],
	},
	{
		name: "Barisal",
		districts: [
			{ name: "Barisal" },
			{ name: "Bhola" },
			{ name: "Patuakhali" },
			{ name: "Pirojpur" },
			{ name: "Jhalokati" },
			{ name: "Barguna" },
		],
	},
	{
		name: "Sylhet",
		districts: [
			{ name: "Sylhet" },
			{ name: "Moulvibazar" },
			{ name: "Habiganj" },
			{ name: "Sunamganj" },
		],
	},
	{
		name: "Rangpur",
		districts: [
			{ name: "Rangpur" },
			{ name: "Dinajpur" },
			{ name: "Lalmonirhat" },
			{ name: "Nilphamari" },
			{ name: "Panchagarh" },
			{ name: "Thakurgaon" },
			{ name: "Kurigram" },
			{ name: "Gaibandha" },
		],
	},
	{
		name: "Mymensingh",
		districts: [
			{ name: "Mymensingh" },
			{ name: "Jamalpur" },
			{ name: "Netrokona" },
			{ name: "Sherpur" },
		],
	},
];

// Get all regions with districts
export const getRegions = async (req, res) => {
	try {
		res.status(200).json({
			success: true,
			regions: regionsData,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
