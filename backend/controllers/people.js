const express = require('express');
const router = express.Router();
const personService = require('../services/people');

router.post('/', async (req, res) => {
    try {
        const newPerson = await personService.createPerson(req.body);
        res.status(201).json(newPerson);
    } catch (error) {
        res.status(500).json({ error: error.message, value: error.value });
    }
});

router.get('/', async (req, res) => {
    try {
        const people = await personService.getPeople();
        res.status(200).json(people);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const person = await personService.getPersonById(req.params.id);
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedPerson = await personService.updatePerson(req.params.id, req.body);
        res.status(200).json(updatedPerson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await personService.deletePerson(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;