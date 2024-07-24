const express = require('express');
const router = express.Router();
const contactService = require('../services/contacts');

router.post('/', async (req, res) => {
    try {
        const newContact = await contactService.createContact(req.body);
        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({ error: error.message, value: error.value });
    }
});

router.get('/', async (req, res) => {
    try {
        const contacts = await contactService.getContacts();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const contact = await contactService.getContactById(req.params.id);
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedContact = await contactService.updateContact(req.params.id, req.body);
        res.status(200).json(updatedContact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await contactService.deleteContact(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
