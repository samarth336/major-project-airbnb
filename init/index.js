const mongoose=require("mongoose");
const initData=require("./data")
const Listing=require("../models/listing")


const MONGO_URL="mongodb://127.0.0.1:27017/wonderlust";

main().then(()=>{
    console.log("connected DB");
}).catch((err)=>{
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68164b82e1032cce15239ab0"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();
