const mysql = require('mysql');
const {promisify} = require('util');

const {database} = require('./keys');

const pool = mysql.createPool(database);

pool.getConnection((err, connection)=>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('Database Connection was closed');
        }
        if(err.code === 'ER_CON_COUNT_ERRIR'){
            console.error('Database has to many connections');
        }
        if(err.code === 'ECONNREFUSED'){
            console.error('Database Connection was refused');
        }
    }

    if(connection) connection.release();
    console.log('DB is Connected')
    return;
}); 

pool.query = promisify(pool.query);

module.exports = pool;
