const express = require('express');
const router = express.Router();

let items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

// Get all items
router.get('/items', (req, res) => {
  res.json(items);
});

// Get single item by ID
router.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

// Create new item
router.post('/items', (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update item
router.put('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Item not found' });
  item.name = req.body.name;
  res.json(item);
});

// Delete item
router.delete('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Item not found' });
  items.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
