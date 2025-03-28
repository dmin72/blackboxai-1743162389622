const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');

// Ottieni tutti gli eventi
router.get('/events', EventController.getEvents);

// Ottieni un evento specifico
router.get('/events/:id', EventController.getEventById);

// Crea un nuovo evento
router.post('/events', EventController.createEvent);

// Aggiorna un evento esistente
router.put('/events/:id', EventController.updateEvent);

// Elimina un evento
router.delete('/events/:id', EventController.deleteEvent);

module.exports = router;