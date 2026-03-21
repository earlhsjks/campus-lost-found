const Claim = require('../models/Claim');

const claimItem = async (req, res) => {
    try {
        const { userId } = req.user._id;
        const { itemId, proof } = req.params;

        if (userId != itemId.reportedBy.userId) {
            res.status(401).json({ success: false, message: 'Access denied.' })
        }

        const newClaimData = await Claim.create({
            itemId: itemId,
            claimantID: req.user._id,
            proof: proof,
        })
        
        res.status(201).json({
            success: true,
            message: 'Item claimed successfully',
            item: newCreateData
        })

    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err}` })
    }
}

const approveClaim = async (req, res) => {
    const session = await mongoose.startSession ();
    session.startTransaction();

    try {
        const { claimId } = req.params;

        const claim = await Item.findById(claimId);

        if (!claim) {
            res.status(404).json({ success: false, message: 'Claim not found.' })
        }

        const itemId = claim.itemId

        const updateClaim = await Claim.findByIdAndUpdate(claimId, {
            status: 'approved',
        }, { session })

        const updateItem = await Item.findByIdAndUpdate(itemId, {
            status: 'claimed',
        }, { session })

        await session.commitTransaction();
    } catch (err) {

        await session.abortTransaction();
        res.status(500).json({ success: false, message: `Server error: ${err}` })
    } finally {
        await session.endSession;
    }
}

module.exports = { 
    claimItem,
    approveClaim
 }