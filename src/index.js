const { getRandomWordSync, getRandomWord } = require('word-maker');

console.log('It works!');


// YOUR CODE HERE


//.map for associative arrays
const mapObject=(obj,iterator)=>Object.keys(obj).reduce(
  (acc,key,ix)=>Object.assign(acc,{
      [key]:iterator(obj[key],key)
  }
),{});

Object.prototype.map=function(iterator){
  return mapObject(this,iterator)
};

//base templates
const range=(n)=>(new Array(n)).fill(0).map((n,i)=>i+1);

const rangeObject=arr=>arr.reduce((acc,val,ix)=>Object.assign(acc,{
  [ix+1]:val
}),{});

const isNode=()=>Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';


/**
* Business logic and constants
*/
const testSize=100;

//actual generator
const getDataArray=({
  number=testSize,
  withFizzBuzz=false,
  withErrors=false,
  sync=true
}={})=>range(number).map((ix)=>{
  try{
      switch(true)
      {
          case withFizzBuzz && (ix%15===0):
              return 'FizzBuzz';
          case withFizzBuzz && (ix%5===0):
              return 'Buzz';
          case withFizzBuzz && (ix%3===0):
              return 'Fizz';
          default:
              return sync?
                  getRandomWordSync({withErrors}):
                  getRandomWord({withErrors}).catch(err=>'Error!');
         
      }
  }
  catch (e)
  {
      return 'Error!';
  }
});

//API endpoints
const getDataListSync=(argObj={})=>
  rangeObject(getDataArray(
      Object.assign({},argObj,{sync:true})
  ));
const getDataList=(argObj={})=>
  Promise.all(getDataArray(
      Object.assign({},argObj,{sync:false})
  )).then(results=>rangeObject(results));

//Send tasks to external endpoint and to console
const processTasks=(tasks=[], endpoint='output.json')=>{
  console.log(tasks);
  if (isNode())
  {
      try
      {
          require('fs')
              .writeFile(
                  './'+endpoint,
                  JSON.stringify(tasks),
                  function(err)
                  {
                      if (err)
                          throw err;
                      console.log(`Tasks for endpoint ${endpoint} done`);
                  }
              );
      }
      catch(e){
          console.error(e)
      };
  }
  else
  {
      window && window.fetch(`/output/${endpoint}`,
      {
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(tasks)
      })
      .then((res)=>console.log(`Tasks for endpoint ${endpoint} done`))
      .catch(console.error);
  }
}

/**
* Tasks definitions
*/
const TasksSync={
  'Full list, sync':getDataListSync(),
  'Fizz buzz list, sync':getDataListSync({withFizzBuzz:true}),
  "It shouldn't break anything!, sync":getDataListSync({withFizzBuzz:true, withErrors:true})
}

const TasksAsync={
  'Full list, async':getDataList(),
  'Fizz buzz list, async':getDataList({withFizzBuzz:true}),
  "It shouldn't break anything!, async":getDataList({withFizzBuzz:true, withErrors:true})
}

/**
* Execution part
*/

//Run async
Promise.all(Object.values(TasksAsync)).then(results=>{
  processTasks(Object.keys(TasksAsync).reduce((acc,key,ix)=>Object.assign(acc,{
      [key]:results[ix]
  }),{}),'output-async.json');
});

//Run sync
processTasks(TasksSync);