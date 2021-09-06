function getUsers(connection,res) { 
    connection.query('select * from users',(error,results,fields) => {
        res.json(results);
    })

} 

module.exports = {
    getUsers
}