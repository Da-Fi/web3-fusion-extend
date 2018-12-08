var express = require("express");
var router = express.Router();

var { getConnection } = require("../dbapi/dbapi.js");

/* GET users listing. */
// http://localhost:3000/blocks/30?sort=asc&page=200&size=50&field=timestamp
// {"sort":"asc","page":"200","size":"50","field":"timestamp"}{"block":"30"}
/*** examples
 * 
 *   http://localhost:3000/blocks/latest
 *   http://localhost:3000/blocks/300
 *
 *   http://localhost:3000/blocks/all?sort=asc&page=2&size=10&field=height
 * 
 *   fields can be:  [ timestamp, hash , numberOfTransactions, height ]
 * 
 */
router.get("/:block", function(req, res, next) {
  let allowedFields = {
    timestamp: true,
    hash: true,
    numberOfTransactions: true,
    height: true
  };
  let blockNumber = req.params.block;
  let page =  req.query.page || 0;
  let size = req.query.size || 1;
  let field = allowedFields[req.query.field] ? req.query.field : 'height'

  page = parseInt( page )
  size = parseInt( size )

  if ( size > 100 || size < 1  || isNaN(size) ) {
    console.log( "size " , size )
    size = 100
  }

  if ( isNaN(page) ) {
    page = 0
  }

  if (blockNumber === "all") {
    getConnection().then(conn => {
      conn
        .query(`SELECT * FROM fusionblockdb.blocks order by ${field} limit ?,?` , [ (page*size), size ] )
        .then(rows => {
          console.log( field, page , size  )
          res.send(rows)
        })
        .finally(() => {
          conn.release();
        });
    });
  } else if ( blockNumber === 'latest') {
    getConnection().then(conn => {
      conn
        .query("SELECT * FROM fusionblockdb.blocks order by height desc limit 1" )
        .then(rows => {
          console.log( rows )
          res.send(rows)
        })
        .finally(() => {
          conn.release();
        });
    });
  } else {
    // else get one block
    getConnection().then(conn => {
      conn
        .query("select * from blocks where height = ?", [parseInt(blockNumber)])
        .then(rows => {
          console.log( blockNumber)
          console.log( rows )
          res.send(rows)
        })
        .finally(() => {
          conn.release();
        });
    });
  }
});

module.exports = router;