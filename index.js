var fs = require('fs');
var path = require('path');

function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function(item,index) {
        promises.push( function(item,i) {
            return new Promise(function(resolve, reject) {
                return block.apply(this,[item,index,resolve,reject]);
            });
        }(item,index))
    });
    return Promise.all(promises);
}

function readFiles(dirname) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function(err, filenames) {
            if (err) return reject(err);
            promiseAllP(filenames,
            (filename,index,resolve,reject) =>  {
                fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                    if (err) return reject(err);
                    return resolve({filename: filename, contents: content});
                });
            })
            .then(results => {
                return resolve(results);
            })
            .catch(error => {
                return reject(error);
            });
        });
  });
}

var folder = 'data';

readFiles(folder)
.then(files => {
    console.log('>> Loaded ' + files.length + ' files');
    
    files.forEach( (item, index) => {
      var content = JSON.parse(item.contents);
      var items = content.businesses;
      pushItemsToDB(items);
    });
})
.catch( error => {
    console.log( error );
});

function pushItemsToDB(items) {
  var file = 'db.json';

  fs.readFile(file, 'utf-8', function readFileCallback(err, data){
    if (err) {
        console.log(err);
    } else {
      obj = JSON.parse(data);
      console.log('>> Target already contains ' + obj.stores.length + ' items');
      
      items.forEach(function addItemToStoresArray(item) {
        obj.stores.push(item);
      });

      json = JSON.stringify(obj);
      fs.writeFile(file, json, 'utf-8', function succeddfullyWritten(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('>> Successfully added ' + items.length + ' items');
        }
      });
    }
  });
}
