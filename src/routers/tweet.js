const express = require('express')
const Tweet = require('./../models/tweet')
const auth = require('./../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const upload = multer({
    limits: {
        fileSize: 100_000_000
    }
})

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

router.get('/tweets', async (req, res) => {
    try {
        const tweets = await Tweet.find({})

        if (!tweets) {
            return res.status(404).send()
        }

        res.status(200).send(tweets)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/uploadTweetImage/:id', auth, upload.single('upload'), async (req, res) => {
    const tweet = await Tweet.findById(req.params.id)

    if (!tweet) {
        throw new Error('Cannot find the Tweet')
    }

    const buffer = await sharp(req.file.buffer).resize({ width: 350, height: 350 }).png().toBuffer()

    tweet.image = buffer
    await tweet.save()

    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/tweets/:id/image', async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet) {
            throw new Error('Tweet image does not exist')
        }

        res.set('Content-Type', 'image/jpg')
        res.status(200).send(tweet.image)

    } catch (error) {
        res.status(500).send(error)
    }
})

router.put('/tweets/:id/like', auth, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
        if (!tweet.likes.includes(req.user.id)) {
            await tweet.updateOne({ $push: { likes: req.user.id }})
            res.status(200).send("Post has been liked")
        } else {
            res.status(403).send("You have already liked this Tweet")
        }

    } catch (error) {
        res.status(500).send(error)
    }
})

router.put('/tweets/:id/unlike', auth, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
        if (tweet.likes.includes(req.user.id)) {
            await tweet.updateOne({ $pull: { likes: req.user.id }})
            res.status(200).send("Post has been unliked")
        } else {
            res.status(403).send("You have not liked this Tweet")
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tweets/:id', async (req, res) => {
    try {
        const tweet = await Tweet.find({ user: req.params.id })

        if (!tweet) {
            return res.status(404).send()
        }

        res.status(200).send(tweet)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
