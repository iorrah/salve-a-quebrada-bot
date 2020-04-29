var fs = require('fs');
var path = require('path');

var PATH_TARGET = 'db.json';

var chainVenues = [
  "bob's",
  "bobs",
  "mcdonald",
  "mc donald",
  "mc donalds",
  "mcdonalds",
  "mcdonald's",
  "burger king",
  "burgerking",
  "habbibs",
  "habibs",
  "habib",
  "habib's",
  "giraffas",
  "girafas",
  "kfc",
  "star bucks",
  "starbucks",
  "starbuck",
  "pizza hut",
  "pizzahut",
  "ragazzo",
  "outback",
  "outback steakhouse",
  "subway",
  "bigxpicanha",
  "big x picanha",
  "frango frito",
  "divino fogão",
  "divino fogão",
  "china in box",
  "taco bell",
  "wendy's",
  "wendys",
  "popeyes",
  "dunkin' donuts",
  "dunkin donuts",
  "domino",
  "dominos",
  "domino's",
];

function filterByImage(array) {
  return array.filter((item) => {
    if (item.image !== '') {
      return true;
    }

    return false;
  });
}

function filterByChainVenue(array) {
  return array.filter((item) => {
    if (chainVenues.indexOf(item.name.toLowerCase()) >= 0) {
      return false;
    }

    return true;
  });
}

function filterUniqId(arr) {
  return arr.reduce(function(p, c) {
    var id = c.id;

    if (p.temp.indexOf(id) === -1) {
      p.out.push(c);
      p.temp.push(id);
    }
    return p;
  }, {
    temp: [],
    out: []
  }).out;
}

function filter(array) {
  var filtered = array;
  filtered = filterByImage(filtered);
  filtered = filterByChainVenue(filtered);
  filtered = filterUniqId(filtered);
  return filtered;
}

function startFilter() {
  console.log('Starting filtering');

  try {
    var stringJSON = fs.readFileSync(PATH_TARGET, 'utf-8');
  } catch(err) {
    console.log(err);
  }

  var listJSON = JSON.parse(stringJSON);

  if (!listJSON.stores.length) {
    console.log('Array is empty');
    return;
  }

  console.log('Target has ' + listJSON.stores.length + ' items');
  var filteredItems = filter(listJSON.stores);

  var filteredJSON = { stores: filteredItems };

  if (fs.existsSync(PATH_TARGET)) {
    var stringFilteredJSON = JSON.stringify(filteredJSON);

    try {
      fs.writeFileSync(PATH_TARGET, stringFilteredJSON);
      console.log('Target now has ' + filteredItems.length + ' items');
    } catch(err) {   
      console.log(err);
    };
  }
}

startFilter();
