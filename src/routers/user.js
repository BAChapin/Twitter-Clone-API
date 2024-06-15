const express = require('express')
const User = require('./../models/user')

const router = new express.Router()

router.post('/users', async (req, res) => {
    console.log(req.body)
    const user = new User(req.body)

    try {
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router