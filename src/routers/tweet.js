const express = require('express')
const Tweet = require('./../models/tweet')
const auth = require('./../middleware/auth')

const router = new express.Router()

router.post('/tweets', auth, async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        user: req.user._id
    })

    try {
        await tweet.save()
        res.status(200).send(tweet)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
