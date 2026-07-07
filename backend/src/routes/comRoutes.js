const express = require('express');
const router  = express.Router();
const {
  getAllComputers,
  getComputerById,
  createComputer,
  updateComputer,
  deleteComputer,
} = require('../controllers/comController');

router.get('/',       getAllComputers);
router.get('/:id',    getComputerById);
router.post('/',      createComputer);
router.put('/:id',    updateComputer);
router.delete('/:id', deleteComputer);

module.exports = router;