var fs = require('fs');
var path = require('path');

var PATH_TARGET = 'db.json';

function consoleLog(string, withSeparator) {
  if (withSeparator) console.log('----------');
  console.log('>> ' + string);
}

function consoleError(string) {
  consoleLog('Error!');
  console.log(string);
}

function moveOutputToAPI() {
  try {
    fs.renameSync(PATH_TARGET, PATH_API + PATH_TARGET);
    consoleLog('File moved to API folder');
  } catch(err) {
    consoleError(err);
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function startShuffle() {
  console.log('Starting shuffling');

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
  var shuffledItems = shuffle(listJSON.stores);
  var shuffledJSON = { stores: shuffledItems };

  if (fs.existsSync(PATH_TARGET)) {
    var stringShuffledJSON = JSON.stringify(shuffledJSON);

    try {
      fs.writeFileSync(PATH_TARGET, stringShuffledJSON);
      moveOutputToAPI();
      console.log('Shuffling is complete');
    } catch(err) {   
      console.log(err);
    };
  }
}

startShuffle();
