const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('./../models/user')
const auth = require('./../middleware/auth')

const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 100_000_000
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.status(200).send({ user, token })
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(400).send()
        }

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()

    if (req.user.avatar != null) {
        req.user.avatar = null
        req.user.avatarExists = false
    }

    req.user.avatar = buffer
    req.user.avatarExists = true
    await req.user.save()

    res.send(buffer)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('The user doesnt exist')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.put('/users/:id/follow', auth, async (req, res) => {
    if (req.user.id != req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            if (!user.followers.includes(req.user.id)) {
                await user.updateOne({ $push: { followers: req.user.id }})
                await req.user.updateOne({ $push: { following: req.params.id }})
                res.status(200).json('User has been followed.')
            } else {
                res.status(403).json('You already follow this user.')
            }
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json('You cannot follow yourself.')
    }
})

module.exports = router