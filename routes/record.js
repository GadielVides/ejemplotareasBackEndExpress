const express = require('express');
const os = require('os');

const recordRoutes = express.Router();
const dbo = require('../db/conn');

/**
 * @swagger
 * components:
 *   schemas:
 *     Tarea:
 *       type: object
 *       required:
 *         - nombre
 *         - hecho
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la tarea
 *           example: "507f1f77bcf86cd799439011"
 *         nombre:
 *           type: string
 *           description: Nombre de la tarea
 *           example: "Completar proyecto"
 *         hecho:
 *           type: boolean
 *           description: Estado de completado de la tarea
 *           example: false
 *     TareaInput:
 *       type: object
 *       required:
 *         - nombre
 *         - hecho
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la tarea
 *           example: "Nueva tarea"
 *         hecho:
 *           type: boolean
 *           description: Estado de completado
 *           example: false
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información del servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Información del sistema
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
recordRoutes.route('/').get(async function (_req, res) {
  res.status(200).send('Bienvenido al Backend!!' 
  + "<br> Hostname = " + os.hostname()
  + "<br> OS = " + os.platform()
  + "<br> version = " + os.version()
  + "<br> Total Memoria "+ os.totalmem()  
  );  
});

/**
 * @swagger
 * /error:
 *   get:
 *     summary: Endpoint de prueba de error
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Respuesta de error de prueba
 */
recordRoutes.route('/error').get(async function (_req, res) {
  res.status(200).send('Error');  
});

/**
 * @swagger
 * /tareas:
 *   get:
 *     summary: Obtiene todas las tareas
 *     tags: [Tareas]
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 *       400:
 *         description: Error al obtener las tareas
 */
recordRoutes.route('/tareas').get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('Tarea')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching listings!');
      } else {
        res.json(result);
      }
    });
});

/**
 * @swagger
 * /tareas:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tareas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TareaInput'
 *     responses:
 *       200:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la tarea creada
 *       400:
 *         description: Error al crear la tarea - datos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Los campos nombre y hecho son requeridos"
 */
recordRoutes.route('/tareas').post(function (req, res) {
  const dbConnect = dbo.getDb();
  
  // VALIDACIÓN AGREGADA ⭐
  if (!req.body.nombre || req.body.hecho === undefined) {
    return res.status(400).json({ 
      error: 'Los campos nombre y hecho son requeridos' 
    });
  }

  const matchDocument = {
    nombre: req.body.nombre,
    hecho: req.body.hecho,
  };

  dbConnect
    .collection('Tarea')
    .insertOne(matchDocument, function (err, result) {
      if (err) {
        res.status(400).send('Error inserting matches!');
      } else {
        console.log(`Added a new match with id ${result.insertedId}`);
         res.status(200).send({'id': result.insertedId});
      }
    });
});

/**
 * @swagger
 * /tareas/{id}:
 *   put:
 *     summary: Actualiza una tarea existente
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a actualizar
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TareaInput'
 *           examples:
 *             completar_tarea:
 *               summary: Marcar tarea como completada
 *               value:
 *                 nombre: "Tarea completada"
 *                 hecho: true
 *             actualizar_nombre:
 *               summary: Cambiar nombre de tarea
 *               value:
 *                 nombre: "Nuevo nombre de tarea"
 *                 hecho: false
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarea actualizada exitosamente"
 *                 modifiedCount:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Error al actualizar la tarea
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID de tarea inválido"
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tarea no encontrada"
 */

recordRoutes.route('/tareas/:id').put(function (req, res) {
  var mongodb = require('mongodb');
  var ObjectID = require('mongodb').ObjectID;
  var update_id = req.params.id;
  const dbConnect = dbo.getDb();

  //Validar que el ID sea válido
  if(!ObjectID.isValid(update_id)){
    return res.status(400).json({error:'ID de tarea inválido'});
  }

  const filter = { "_id": new mongodb.ObjectID(update_id.toString())};
  const updateDocument = {
    $set:{
      nombre: req.body.nombre,
      hecho: req.body.hecho,
    }
  };

  dbConnect
    .collection('Tarea')
    .updateOne(filter, updateDocument, function (err, result){
      if (err){
        console.error('Error updating task:',err);
        res.status(400).json({ error: 'Error al actualizar la tarea'});
      } else if (result.matchedCount === 0){
        res.status(404).json({ error: 'Tarea no encontrada'});
      } else {
        console.log(`Tarea actualizada con ID: ${update_id}`);
        res.status(200).json({
          message: 'Tarea actualizada exitosamente',
          modifiedCount: result.modifiedCount
        });
      }
    });
});


/**
 * @swagger
 * /tareas/delete/{id}:
 *   delete:
 *     summary: Elimina una tarea por ID
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a eliminar
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       204:
 *         description: Tarea eliminada exitosamente
 *       400:
 *         description: Error al eliminar la tarea
 */
recordRoutes.route('/tareas/delete/:id').delete((req, res) => {
  var mongodb = require('mongodb');
  var ObjectID = require('mongodb').ObjectID;
  var delete_id = req.params.id;
  const dbConnect = dbo.getDb();

  const listingQuery = { "_id": new mongodb.ObjectID(delete_id.toString()) };
  
  dbConnect
    .collection('Tarea').deleteOne(listingQuery)
    .then(()=>{
      res.status(204).send();
      console.log("Se pudo eliminar"+ listingQuery._id);
    });
});

module.exports = recordRoutes;