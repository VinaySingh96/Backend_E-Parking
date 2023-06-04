const express = require('express');
const router = express.Router();
const ParkingLots = require('../models/ParkingLot');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');


// Route 1: get all the ParkingLots of the user using GET: Login required, fetchUser is used as middleware so that it verifies the access token(id included) and in return gives the user of that id
router.get('/fetchAllParkingLots', fetchUser, async (req, res) => {
    const ParkingLots = await ParkingLots.find({ user: req.user.id })
    res.json(ParkingLots);
})
// Route 2: Fetch all parking lot for admin.
router.get('/fetchAllParkingLots_admin', async (req, res) => {
    const allParkingLots = await ParkingLots.find({IsApproved:true})
    res.json(allParkingLots);
})
// Route 3: Create a ParkingLot using POST : Login required
router.post('/createParkingLot', fetchUser, async (req, res) => {
    try {
        console.log("Creating a new parking lot with details :", req.body)
        const { Name, WalletAddress, Fee, TotalSlots, Lattitude, Longitude } = req.body; // destructuring from req.body
        const error = validationResult(req);
        if (!error.isEmpty()) {
            // console.log(error.array);
            return res.status(400).json({ errors: error.array });
        }
        const ParkingLot = new ParkingLots({
            Name: Name, WalletAddress: WalletAddress, Fee: Fee, TotalSlots: TotalSlots, Lattitude: Lattitude, Longitude: Longitude, user: req.user.id
        })
        const saveParkingLots = await ParkingLot.save();
        res.json(saveParkingLots);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 4: Updating an existing ParkingLot using PUT : Login required
router.put('/updateParkingLot/:id', fetchUser, async (req, res) => {

    console.log("Request for UPDATE parking lot with user id : ",req.user.id," and parking lot id : ",req.params.id);
    // create a newParkingLot object
    const newParkingLot = req.body;
    console.log("\nUpdate with these details : ",req.body);

    // find the ParkingLot to update and update it
    let ParkingLot = await ParkingLots.findById(req.params.id);
    if (!ParkingLot) { return res.status(404).send("Not Found") }
    // to authonticate that the user is same(whose ParkingLots is) which is trying to update
    if (ParkingLot.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }
    newParkingLot.IsApproved=false;
    newParkingLot.Status="UPDATE";
    ParkingLot = await ParkingLots.findByIdAndUpdate(req.params.id, { $set: newParkingLot }, { new: true })
    res.json({ ParkingLot });
})

// Route 5: Deleting an existing ParkingLot using DELETE : Login required
router.delete('/deleteParkingLot/:id', fetchUser, async (req, res) => {
    console.log("Request for DELETE parking lot with user id : ",req.user.id," and parking lot id : ",req.params.id);
    let ParkingLot = await ParkingLots.findById(req.params.id);
    
    if (!ParkingLot) { return res.status(404).send("Not Found") }
    if (ParkingLot.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }
    ParkingLot = await ParkingLots.findByIdAndUpdate(req.params.id,{$set:{"IsApproved":false,"Status":"DELETE"}});
    res.status(200).send({"Remark":"Request is under process."});
})


// Admin approves the parking lot

router.post('/approvePL_admin/:id', async (req, res) => {
    let ParkingLot = await ParkingLots.findById(req.params.id);
    if (!ParkingLot) { return res.status(404).send("Not Found") };
    const newParkingLot = req.body;
    if(newParkingLot.Status=="NEW")
    {
        console.log("Admin :: Approved -- CREATE the parking lot with id : ",req.params.id)
        try {
            ParkingLot = await ParkingLots.findByIdAndUpdate(req.params.id, { $set: { IsApproved: true } }, { new: true })
        } catch (err){
            res.status(500).send({'error':err});
        }
    }
    else if(newParkingLot.Status=="UPDATE")
    {
        console.log("Admin :: Approved -- UPDATE the parking lot with id : ",req.params.id)
        try {
            ParkingLot = await ParkingLots.findByIdAndUpdate(req.params.id, { $set: { IsApproved: true, Status:"NEW" } }, { new: true })
        } catch (err){
            res.status(500).send({'error':err});
        }
    }
    else if(newParkingLot.Status=="DELETE")
    {
        console.log("Admin :: Approved -- DELETE the parking lot with id : ",req.params.id)
        try {
            ParkingLot = await ParkingLots.findByIdAndDelete(req.params.id)
        } catch (err){
            res.status(500).send({'error':err});
        }
    }
    res.status(200).send("Updated successfully")
})

// Reduce parking lot size by 1 as booked by user.
router.put('/updateSlot/:id', async (req,res)=>{
    console.log("Update available slot by user")
    let pl= await ParkingLots.findById(req.params.id);
    if(pl.TotalSlots<=0){
        res.json({"Remark":"No free slot available for this parking lot."})
    }
    else
    {
        let parkingLot= await ParkingLots.findByIdAndUpdate(req.params.id,{$set :{TotalSlots:pl.TotalSlots-1}});
        res.status(200).json({parkingLot});
    }
})

module.exports = router;