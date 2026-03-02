import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('GET /users');
});

router.get('/:id', (req, res) => { res.send(`GET /users/${req.params.id}`); });

router.put('/:id', (req, res) => { res.send(`PUT /users/${req.params.id}`); });

router.delete('/:id', (req, res) => { res.send(`DELETE /users/${req.params.id}`); });

export default router;