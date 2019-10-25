let MongoClient = require('mongodb').MongoClient;


let express = require('express');
let app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

let db;


MongoClient.connect(
    'mongodb://127.0.0.1:27017/',
    { useUnifiedTopology: true, useNewUrlParser: true },
    function (err, client) {
        if (err !== null) {
            console.log(err);
            return;
        }
        db = client.db('hotel');

    }
);

app.post('/clientes', function (req, res) {
    let nombreCliente = req.body.nombre;
    let dniCliente = req.body.dni;
    db.collection('clientes').insertOne({ nombre: nombreCliente, dni: dniCliente });
    res.send('Check in completado');
})



app.put('/reservas', function(req,res){
    let dni = req.query.dni;
    let habitacion = req.query.habitacion;

    db.collection('clientes').find().toArray(function (err, datos) {
        if (err !== null) {
            console.log(err);
            return;
        }

   if ( db.collection('clientes').find({dni:dni}) === null){
       res.send('cliente no registrado');
   }else if (db.collection('habitaciones').find({$and:[{nombre:habitacion},{ocupado:false}]}) === null) {
       res.send('habitación ocupada, elija otra por favor')
   }else{
       db.collection('habitaciones').update({nombre:habitacion},{$set:{ocupado:true}});
       db.collection('reservas').insertOne({dni:dni,habitacion:habitacion});
       res.send('habitación reservada');
   }
   
        })
    
})
app.put('/checkOut', function(req,res){
    let dni = req.query.dni;
    let habitacion = req.query.habitacion;

    db.collection('clientes').find().toArray(function (err, datos) {
        if (err !== null) {
            console.log(err);
            return;
        }

   if ( db.collection('clientes').find({dni:dni}) === null){
       res.send('cliente no registrado');
   }else if (db.collection('habitaciones').find({$and:[{nombre:habitacion},{ocupado:true}]}) === null) {
       res.send('Se ha equivocado de habitación')
   }else{
       db.collection('habitaciones').update({nombre:habitacion},{$set:{ocupado:false}});
       res.send('Hasta pronto');
   }
   
        })
    
})

app.put('/:dni',function(req,res){

    let dni = req.params.dni;
    let  nombreNuevo= req.query.nombre;
    let apellidoNuevo = req.query.apellido;

    db.collection('clientes').updateOne({dni: dni},{$set:{nombre:nombreNuevo},});
    db.collection('clientes').updateOne({dni:dni},{$set:{apellido:apellidoNuevo},});

    res.send("Datos del cliente modificados");

});



app.get('/habitaciones', function (req, res) {
    let texto = '';
    db.collection('habitaciones').find().toArray(function (err, datos) {
        if (err !== null) {
            console.log(err);
            return;
        }

        for (let i = 0; i < datos.length; i++) {
            texto += `<h1>${datos[i].nombre}</h1>`;
            texto += `<p>${datos[i].ocupado}</p >`;
        
        }
        res.send(texto);
    });
});





app.listen(5005);
