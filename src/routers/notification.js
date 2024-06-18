const express = require('express')
const auth = require('./../middleware/auth')
const Notification = require('./../models/notification')

const router = new express.Router()

router.post('/notification', auth, async (req, res) => {
    const notification = new Notification({
        ...req.body,
        user: req.user.id
    })

    try {
        await notification.save()
        res.status(200).send(notification)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/notification', async (req, res) => {
    try {
        const notifications = await Notification.find({})
        res.status(200).send(notifications)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/notification/:id', async (req, res) => {
    try {
        const notifications = await Notification.find({ notReceiverId: req.params.id })
        res.status(200).send(notifications)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router