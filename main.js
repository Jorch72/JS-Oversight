//load URI parameters
var loadGameNum = getURIVar("load");
var playCount = null;
var cityCount = null;
var  recCount = null;
var curPlay = 0;
if(loadGameNum === null || loadGameNum < 0)
{
  loadGameNum = null;
  playCount = getURIVar("players");
  if(playCount === null || playCount < 2)playCount = 2;
  cityCount = getURIVar("cities");
  if(cityCount === null || cityCount < 1)cityCount = 5;
  recCount = getURIVar("resources");
  if(recCount === null || recCount < 0)recCount = 300;
}
else
{
  console.log("Loading Game " + loadGameNum + "...");
  var temp = localStorage.getItem(loadGameNum + "gameData");
  var gameData = temp.split("&");
  playCount = parseInt(gameData[0]);
  curPlay   = parseInt(gameData[1]);
  cityCount = parseInt(gameData[2]);
}

//game engine vars
const version = "1.1";
const can = {w:3000,h:3000};
const FPS = 30; //how many game sycles per second
const SPS = 5; //how many revolutions the ASCII spinner makes per second
const maxTeams = playCount; //number of team, must be at least 2, no more than 6;
const circleDotMult = 1; //multiplys the range of an obj to get the number of dots in the circle
const hax = getURIVar("param");
const startingFuel = recCount;
const citiesCount = cityCount;//how many cities per team
const turnTime = {m:3,s:0};//how much time is in each turn
const gameTime = {m:1,s:0};//how long to run the game between each turn session
const nukeMaxAlt = 300; //The highest height a nuke can reach

//make obj data
const jet = 
{
  data: //draw a 'Y'
    [
    {x: 0,y: 0,drawln:false},
    {x: 9,y: 0,drawln:true },
    {x: 0,y: 0,drawln:false},
    {x:-3,y: 5,drawln:true },
    {x: 0,y: 0,drawln:false},
    {x:-3,y:-5,drawln:true }
    ],
  name:"Interceptor",
  speed:4,
  fuel:4000,
  attack:5,
  range:100,
  health:20,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const bomber = 
{
  data: //draw a shevron
    [
    {x:-2,y: 0,drawln:false},
    {x:-7,y:-7,drawln:true},
    {x: 5,y: 0,drawln:true},
    {x:-7,y: 7,drawln:true},
    {x:-2,y: 0,drawln:true}
    ],
  name:"LRng. Bomber",
  speed:2,
  fuel:120,
  attack:6,
  range:200,
  health:50,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const sat =
{
  data: //draw a square with an 'X' in it
  [
  {x:-5,y: 5,drawln:false},
  {x: 5,y: 5,drawln:true },
  {x: 5,y:-5,drawln:true },
  {x:-5,y:-5,drawln:true },
  {x:-5,y: 5,drawln:true },
  {x: 5,y:-5,drawln:true },
  {x:-5,y:-5,drawln:false},
  {x: 5,y: 5,drawln:true }
  ],
  name:"Satellite",
  speed:8,
  fuel:-1,
  attack:5,
  range:150,
  health:500,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const nuke =
{
  data: //draw a '>>'
  [
  {x:-5,y:-5,drawln:false},
  {x: 5,y: 0,drawln:true },
  {x:-5,y: 5,drawln:true },
  {x:-10,y:-5,drawln:false},
  {x:-5,y: 0,drawln:true },
  {x:-10,y:5,drawln:true },
  ],
  name:"ICBM",
  speed:2,
  fuel:0,
  attack:350,
  range:50,
  health:25,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const fact =
{
  data: //draw a triangle
  [
  {x:-9,y: 9,drawln:false},
  {x: 9,y: 9,drawln:true },
  {x: 0,y:-9,drawln:true },
  {x:-9,y: 9,drawln:true }
  ],
  name:"Factory",
  speed:25, //the number of resources required to manufacture somthing
  fuel:0, //stores the resources needed to build things
  attack:-1,
  range:0,
  health:800,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const base =
{
  data: //draw a square
  [
  {x:-9,y: 9,drawln:false},
  {x: 9,y: 9,drawln:true },
  {x: 9,y:-9,drawln:true },
  {x:-9,y:-9,drawln:true },
  {x:-9,y: 9,drawln:true }
  ],
  name:"Air Base",
  speed:2,  //how many seconds it takes to launch a jet
  fuel:5,   //stores the number of bombers ready to be deployed
  attack:10, //stores the number of jets ready to be deployed
  range:150,//enemy aircraft within this range will trigger a jet launch
  health:1200,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const silo =
{
  data: //draw a diamond
  [
  {x: 0,y:-9,drawln:false},
  {x: 9,y: 0,drawln:true },
  {x: 0,y: 9,drawln:true },
  {x:-9,y: 0,drawln:true },
  {x: 0,y:-9,drawln:true }
  ],
  name:"ICBM Silo",
  speed:0,
  fuel:-1,
  attack:3,
  range:0,
  health:1500,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const city =
{
  data:9, //Draw a circle (data = radius)
  name:"Major City",
  speed:0.5, //how many seconds it takes to produce resources
  fuel:-1,
  attack:-1,
  range:150,
  health:1000,
  angle:0,
  x:0,
  y:0,
  destx:0,
  desty:0,
  originx:0,
  originy:0
};

const authArr = 
[
  " - Connecting to Strategic Defense Initiative computer core",
  " - Logging in with current account...",
  " ---- Username: Valid!",
  " ---- Password: Match!",
  " - Checking Launch Authority...",
  " ---- Authority Level: 7",
  " ---- Minimum Access Level: 7",
  " ---- Requirments Met!",
  " - Varifying target(s)...",
  " ---- X-Origin.....OK",
  " ---- Y-Origin.....OK",
  " ---- X-Dest.......OK",
  " ---- Y-Dest.......OK",
  " ---- X-Node1......OK",
  " ---- Y-Node1......OK",
  " ---- X-Node2......OK",
  " ---- Y-Node2......OK",
  " ---- Targets Valid!",
  " - Calculating Trajectory(s)...",
  " ---- x = href_latitude + dist",
  " ---- y = vref_longitude - dist",
  " ---- controlx = href_latitude / 2 - dist",
  " ---- controly = vref_longitude * 2 - dist",
  " ---- controlr = atan(vref_logitude / href_latitude) + 180",
  " ---- Trajectory(s) finalized!",
  " - Connecting to ICBM launch platform",
  " - Logging in with current account...",
  " ---- Username: Valid!",
  " ---- Password: Match!",
  " - Checking Launch Authority...",
  " ---- Authority Level: 7",
  " ---- Minimum Access Level: 7",
  " ---- Requirments Met!",
  " - Sending targeting data...",
  " ---- Targeting data sent",
  " ---- Loading data into ICBM:" + (Math.floor(Math.random() * 899) + 100) + "/ICBM_guidance.dat",
  " ---- Recalibrating GPS",
  " - Arming: Mark IV Thermonuclear Warhead",
  " ---- Arming codes accepted",
  " ---- Safties disabled",
  " ---- Primers 1 - 34 engaged",
  " ---- Primary detonator activated",
  " ---- Secondary detonator activated",
  " ---- Fully armed: Mark IV Thermonuclear Warhead",
  " - All systems: GO"
];

const menuStat =
[
  null, //no menu open
  {w:120,h:36,t:"SDI-OS/Main"}, //The main menu screen
  {w:480,h:160,t:"SDI-OS/Main/Auth"}, //The nuclear launch code screen
  {w:170,h:45,t:"SDI-OS/Main/Fabrication"}, //build screen
  {w:216,h:48,t:"SDI-OS/Main/Preferences"} //info options screen
];

const colorList = 
[
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Magenta",
  "white",
  "Cyan",
  "Crimson"
];

const factCost = 
{
  jet:20,
  bomber:50,
  nuke:60,
  sat:80,
  city:0, //cant build these
  fact:150,
  base:100,
  silo:180
};

const arrowData = 
[
  {x:-9,y:3,drawln:false},
  {x:3,y:3,drawln:true},
  {x:3,y:6,drawln:true},
  {x:9,y:0,drawln:true},
  {x:3,y:-6,drawln:true},
  {x:3,y:-3,drawln:true},
  {x:-9,y:-3,drawln:true},
  {x:-9,y:3,drawln:true}
];

console.log("Starting OVERSIGHT V" + version);
var keymap = [];
var c = document.getElementById("game");
c.width  = can.w;
c.height = can.h;
var ctx = c.getContext("2d");
var ambient = new Audio("ambient.mp3");
if(!ambient)console.log("Failed to load: ambient.mp3");
var detSound = new Audio("detonation.mp3");
if(!detSound)console.log("Failed to load: detonation.mp3");
ambient.autoplay = true;
var spin = "|";
var matchTime = {s:0,m:0,sm:turnTime.m,ss:turnTime.s}; //ss & sm are used to count down time left for that player to make his move
var convertTime = 0; //convert FPS to seconds
var mouse = {x:0,y:0};
ctx.imageSmoothingEnabled = false;
var dispInfo = 
{
  basic:true,
  jet:true,
  bomber:true,
  sat:true,
  nuke:true,
  fact:true,
  base:true,
  silo:true,
  city:true
};
var launchCodeAttempt = "";
var launchDialogue = [];
var GAMEOVER = false;
var launchCount = 0;
var gameHalt = true;
var cinematic = false; //cinematic mode disables all text
var currentTeam = 0;
var menuData = {m:0,t:"",a:0,x:0,y:0,w:0,h:0,obj:null};
var nukeBlastList = [];
var team = [];
for(var i = 0; i < maxTeams; i++)//Setup team info
{
  var ang = i * 2 * Math.PI / maxTeams;
  team[i] =
  {
    name:"Player" + (i + 1),
    color:colorList[i],
    objs:[],
    deathTime:{m:0,s:0},
    nation:{x:Math.floor((can.w / 2) + Math.cos(ang) * (Math.min(can.w,can.h) / 2 - 300)),
            y:Math.floor((can.h / 2) + Math.sin(ang) * (Math.min(can.w,can.h) / 2 - 300))},
    launchCode:"" + (Math.floor(Math.random() * 8999999999) + 1000000000)
  };
  if(loadGameNum === null)addNation(i, ang, (can.w / 2) + Math.cos(ang) * (Math.min(can.w,can.h) / 2 - 300),
                    (can.h / 2) + Math.sin(ang) * (Math.min(can.w,can.h) / 2 - 300));
}
if(loadGameNum !== null)loadGame(loadGameNum);

addStartFuel();

var gloop = window.setInterval(function(){gameLoop();}, 1000 / FPS);
var sloop = window.setInterval(function(){spinner(); }, 1000 / SPS);

function gameLoop ()
{
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,can.w,can.h);
  if(convertTime >= FPS)
  {
    convertTime = 0;
    GAMEOVER = countMatchTime();
    recDeathTime();
  }
  else
  {
    convertTime++;
  }
  if(!GAMEOVER)
  {
    if(!gameHalt)drawAllNukeBlasts();
    drawAllObjs();
    drawMenu(currentTeam);
    drawInfoBar();
    drawShotClock(currentTeam);
  }
}

function addStartFuel()
{
  for(var t = 0; t < maxTeams; t++)
  {
    for(var i = 0; i < team[t].objs.length; i++)
    {
      var obj = team[t].objs[i];
      if(obj.name === "Factory")obj.fuel = startingFuel;
    }
  }
}

function countMatchTime()
{
  matchTime.s++;
  if(matchTime.sm > 0 || matchTime.ss > 1)
  {
    matchTime.ss--;
  }
  else if(!gameHalt)
  {
    gameHalt = checkGameOver();
    if(gameHalt)
    {
      console.log("NEXT ROUND");
      matchTime.sm = turnTime.m;
      matchTime.ss = turnTime.s;
    }
    else //game over do somthing
    {
      console.log("GAME OVER");
      window.clearInterval(gloop);
      menuData.m = 0;
      c.width = 1024;
      c.height = 128 * Math.floor(maxTeams / 4);
      ctx.fillStyle = "black";
      ctx.fillRect(0,0,c.width,c.height);
      for(var i = 0; i < maxTeams / 4; i++)
      {
        for(var t = 0; t < 4; t++)
        {
          if(i * 4 + t < maxTeams)
          {
            ctx.fillStyle = team[i * 4 + t].color;
            ctx.fillRect(t * 256,i * 128,256,128);
            ctx.textAlign = "center";
            ctx.font = "36px Monospace";
            ctx.fillStyle = "black";
            ctx.fillText(team[i * 4 + t].name,t * 256 + 128,i * 128 + 32);
            ctx.fillText("TIME",t * 256 + 128,i * 128 + 64);
            ctx.fillText("OF DEATH:",t * 256 + 128,i * 128 + 96);
            if(team[i * 4 + t].deathTime.m === 0 && team[i * 4 + t].deathTime.s === 0)
            {
              ctx.fillText("VICTOR",t * 256 + 128,i * 128 + 120);
            }
            else
            {
              ctx.fillText(team[i * 4 + t].deathTime.m + ":" + team[i * 4 + t].deathTime.s,t * 256 + 128,i * 128 + 120);
            }
          }
        }
      }
      return true;
    }
  }
  else
  {
    findNextTeam();
    menuData.m = 0;
    matchTime.sm = turnTime.m;
    matchTime.ss = turnTime.s;
    if(currentTeam >= maxTeams)
    {
      gameHalt = false;
      currentTeam = 0;
      matchTime.sm = gameTime.m;
      matchTime.ss = gameTime.s;
    }
  }
  
  if(matchTime.s >= 60)
  {
    matchTime.s = 0;
    matchTime.m++;
  }
  if(matchTime.ss < 0)
  {
    matchTime.ss = 59;
    matchTime.sm--;
  }
  document.title = "Oversight - " + matchTime.m + ":" + matchTime.s;
  return false;
}

function spinner()
{
  if(spin === "|")
  {
    spin = "/";
  }
  else if(spin === "/")
  {
    spin = "-";
  }
  else if(spin === "-")
  {
    spin = "\\";
  }
  else if(spin === "\\")
  {
    spin = "|";
  }
}

function drawAllObjs()
{
  for(var t = 0; t < maxTeams; t++)
  {
    for(var i = 0; i < team[t].objs.length; i++)
    {
      var obj = team[t].objs[i];
      obj.health = Math.floor(obj.health);
      if(!gameHalt)
      {
        moveObj(t,i);
        if(obj.name === "Interceptor")
        {
          jetAttack(t,i);
        }
        else if(obj.name === "LRng. Bomber")
        {
          bomberAttack(t,i);
        }
        else if(obj.name === "Satellite")
        {
          satAttack(t,i);
        }
        else if(obj.name === "Air Base")
        {
          baseLanding(t,i);
          baseDefend(t,i);
        }
        else if(obj.name === "Major City")
        {
          cityProduction(t,i);
        }
      }
      else if(obj.name === "Major City")
      {
        cityDrawLine(t,i);
      }
      else if(obj.name === "Factory")
      {
        factoryDrawLine(t,i);
      }
      drawObj(t,i);
    }
  }
}

function drawAllNukeBlasts()
{
  for(var b = 0; b < nukeBlastList.length; b++)
  {
    nukeBlastList[b].r = drawNukeBlast(nukeBlastList[b].r,nukeBlastList[b].x,nukeBlastList[b].y);
    if(nukeBlastList[b].r <= 0)remNukeBlast(b);
  }
}

function drawMenu(cTeam)
{
  ctx.font = "11px Monospace";
  switch(menuData.m)
  {
    case 1:
      if(menuData.x === 0 || menuData.y === 0)menuData.m = 0;
      drawMbox(cTeam,menuData.w,menuData.h);
      ctx.strokeStyle = team[cTeam].color;
      ctx.fillStyle   = team[cTeam].color;
      drawMObj(cTeam,jet,8,18);
      drawMObj(cTeam,bomber,32,18);
      drawMObj(cTeam,nuke,56,18);
      drawMObj(cTeam,fact,80,18);
      ctx.font = "24px Monospace";
      ctx.textAlign = "center";
      ctx.fillText("I",menuData.x + 104,menuData.y + 26);
      ctx.beginPath();
      if(menuData.a === 1 || menuData.a === 4)
      {
        ctx.rect(menuData.x + 3,menuData.y + 10,16,16);
      }
      else if(menuData.a === 2 || menuData.a === 5)
      {
        ctx.rect(menuData.x + 23,menuData.y + 10,16,16);
      }
      else if(menuData.a === 3 || menuData.a === 6)
      {
        ctx.rect(menuData.x + 45,menuData.y + 10,16,16);
      }
      ctx.stroke();
    break;
    case 2://enter nuclear launch code
      if(team[cTeam].launchCode === "")
      {
        menuData.m = 0;
        break;
      }
      drawMbox(cTeam,menuData.w,menuData.h);
      if(launchCodeAttempt !== team[cTeam].launchCode)
      {
        ctx.fillStyle = "grey";
        ctx.textAlign = "left";
        ctx.font = "64px Monospace";
        ctx.fillText(" " + team[cTeam].launchCode + " ",menuData.x + 12, menuData.y + 51);
        ctx.fillStyle = team[cTeam].color;
        ctx.fillText(spin + "          " + spin,menuData.x + 12, menuData.y + 51);
        ctx.fillText(" " + launchCodeAttempt + " ",menuData.x + 12, menuData.y + 51);
        ctx.fillText("PLEASE ENTER",menuData.x + 12, menuData.y + 100);
        ctx.fillText("LAUNCH CODE",menuData.x + 12, menuData.y + 150);
      }
      else
      {
        if(launchCount === Math.floor(launchCount))
        {
          if(launchCount >= authArr.length - 1)
          {
            team[cTeam].launchCode = "";
            menuData.m = 0;
          }
          launchDialogue.push(authArr[launchCount]);
          while(launchDialogue.length > 12)launchDialogue.shift(); 
          launchCount += 0.02;
          launchCount = Math.round(launchCount * 1000) / 1000;
        }
        else
        {
          launchCount += 0.02;
          launchCount = Math.round(launchCount * 1000) / 1000;
        }
        ctx.fillStyle = team[cTeam].color;
        ctx.textAlign = "left";
        ctx.font = "11px Monospace";
        for(var t = 0; t < launchDialogue.length; t++)
        {
          ctx.fillText(launchDialogue[t],menuData.x + 2,(menuData.y + 18) + 12 * t);
        }
      }
    break;
    case 3:
      drawMbox(cTeam,menuData.w,menuData.h);
      drawMObj(cTeam,jet,8,18);
      drawMObj(cTeam,bomber,32,18);
      drawMObj(cTeam,nuke,56,18);
      drawMObj(cTeam,sat,80,18);
      drawMObj(cTeam,fact,104,18);
      drawMObj(cTeam,base,128,18);
      drawMObj(cTeam,silo,152,18);
      ctx.fillStyle   = team[cTeam].color;
      ctx.strokeStyle = team[cTeam].color;
      ctx.beginPath();
           if(menuData.a === 1 || menuData.a === 8 )ctx.rect(menuData.x + 3  ,menuData.y + 10,16,16);
      else if(menuData.a === 2 || menuData.a === 9 )ctx.rect(menuData.x + 23 ,menuData.y + 10,16,16);
      else if(menuData.a === 3 || menuData.a === 10)ctx.rect(menuData.x + 45 ,menuData.y + 10,16,16);
      else if(menuData.a === 4 || menuData.a === 11)ctx.rect(menuData.x + 72 ,menuData.y + 10,16,16);
      else if(menuData.a === 5 || menuData.a === 12)ctx.rect(menuData.x + 96 ,menuData.y + 10,16,16);
      else if(menuData.a === 6 || menuData.a === 13)ctx.rect(menuData.x + 120,menuData.y + 10,16,16);
      else if(menuData.a === 7 || menuData.a === 14)ctx.rect(menuData.x + 144,menuData.y + 10,16,16);
      ctx.stroke();
      ctx.textAlign = "left";
      ctx.fillText(factCost.jet   ,menuData.x + 3  ,menuData.y + 36);
      ctx.fillText(factCost.bomber,menuData.x + 24 ,menuData.y + 36);
      ctx.fillText(factCost.nuke  ,menuData.x + 47 ,menuData.y + 36);
      ctx.fillText(factCost.sat   ,menuData.x + 73 ,menuData.y + 36);
      ctx.fillText(factCost.fact  ,menuData.x + 94 ,menuData.y + 36);
      ctx.fillText(factCost.base  ,menuData.x + 118,menuData.y + 36);
      ctx.fillText(factCost.silo  ,menuData.x + 142,menuData.y + 36);
    break;
    case 4:
      drawMbox(cTeam,menuData.w,menuData.h);
      ctx.font = "24px Monospace";
      ctx.textAlign = "center";
      ctx.fillText("B",menuData.x + 14,menuData.y + 26);
      drawMObj(cTeam,jet,32,18);
      drawMObj(cTeam,bomber,56,18);
      drawMObj(cTeam,nuke,80,18);
      drawMObj(cTeam,sat,104,18);
      drawMObj(cTeam,city,128,18);
      drawMObj(cTeam,fact,152,18);
      drawMObj(cTeam,base,176,18);
      drawMObj(cTeam,silo,200,18);
      ctx.font = "24px Monospace";
      ctx.textAlign = "center";
      if(dispInfo.basic )ctx.fillText("*",menuData.x + 14 ,menuData.y + 46);
      if(dispInfo.jet   )ctx.fillText("*",menuData.x + 34 ,menuData.y + 46);
      if(dispInfo.bomber)ctx.fillText("*",menuData.x + 56 ,menuData.y + 46);
      if(dispInfo.nuke  )ctx.fillText("*",menuData.x + 80 ,menuData.y + 46);
      if(dispInfo.sat   )ctx.fillText("*",menuData.x + 104,menuData.y + 46);
      if(dispInfo.city  )ctx.fillText("*",menuData.x + 128,menuData.y + 46);
      if(dispInfo.fact  )ctx.fillText("*",menuData.x + 152,menuData.y + 46);
      if(dispInfo.base  )ctx.fillText("*",menuData.x + 176,menuData.y + 46);
      if(dispInfo.silo  )ctx.fillText("*",menuData.x + 200,menuData.y + 46);
    break;
    default:
      //reset vars when menu is closed
      launchCodeAttempt = "";
      launchCount = 0;
      launchDialogue = [];
      menuData = {m:0,t:"",a:0,x:0,y:0,w:0,h:0,obj:null};
    break;
  }
  if(menuData.obj !== null)
  {
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(menuData.obj.x,menuData.obj.y,16,0,2*Math.PI);
    ctx.stroke();
  }
}

function drawShotClock(cTeam)
{
  var left = (window.pageXOffset || c.scrollLeft) - (c.clientLeft || 0);
  var top  = (window.pageYOffset || c.scrollTop)  - (c.clientTop || 0) + 64;
  var refx = cTeam * 128;
  ctx.fillStyle = "Black";
  ctx.fillRect(left + refx,top,128,64);
  if(gameHalt)
  {
    ctx.fillStyle   = team[cTeam].color;
    ctx.strokeStyle = team[cTeam].color;
  }
  else
  {
    ctx.fillStyle   = "grey";
    ctx.strokeStyle = "grey";
  }
  ctx.beginPath();
  ctx.rect(refx + left,top,128,64);
  ctx.stroke();
  ctx.fillRect(refx + left,top,32,32);
  ctx.fillRect(refx + left + 96,top,32,32);
  ctx.fillRect(refx + left,top + 32,128,32);
  ctx.textAlign = "center";
  ctx.font = "24px Monospace";
  ctx.fillText(matchTime.sm + ":" + matchTime.ss,refx + left + 64,top + 24);
  ctx.fillStyle = "black";
  if(gameHalt)
  {
    ctx.fillText(cTeam + 1,refx + left + 16 ,top + 24);
    ctx.fillText(cTeam + 1,refx + left + 112,top + 24);
  }
  else
  {
    ctx.fillText(spin,refx + left + 16 ,top + 24);
    ctx.fillText(spin,refx + left + 112,top + 24);
  }
  if(!gameHalt)
  {
    ctx.fillText("NEW TURN",refx + left + 64,top + 56);
  }
  else if(cTeam === maxTeams - 1)
  {
    ctx.fillText(" FINISH ",refx + left + 64,top + 56);
  }
  else
  {
    ctx.fillText("END TURN",refx + left + 64,top + 56);
  }
}

function drawInfoBar()
{
  var left = (window.pageXOffset || c.scrollLeft) - (c.clientLeft || 0);
  var top  = (window.pageYOffset || c.scrollTop ) - (c.clientTop  || 0);
  for(var t = 0; t < maxTeams; t++)
  {
    var count = 0;
    for(var i = 0; i < team[t].objs.length; i++)if(team[t].objs[i].name === "Major City")count++;
    ctx.fillStyle   = team[t].color;
    ctx.strokeStyle = team[t].color;
    ctx.fillRect(t * 128 + left,top,128,64);
    ctx.textAlign = "center";
    ctx.font = "24px Monospace";
    ctx.fillStyle = "Black";
    ctx.fillText(team[t].name,t * 128 + left + 64,top + 26);
    ctx.font = "12px Monospace";
    ctx.fillText(count + " of " + citiesCount,t * 128 + left + 64,top + 48);
    ctx.fillText("Cities Remaining",t * 128 + left + 64,top + 62);
    var arrow = {x:t * 128 + left + 64,y:top + 96};
    if(t === currentTeam)arrow.y += 64;
    ctx.beginPath();
    if(team[t].deathTime.m === 0 && team[t].deathTime.s === 0)
    {
      var angle = Math.atan2(team[t].nation.y - arrow.y,
                             team[t].nation.x - arrow.x);
      if(angle < 0)angle = 2 * Math.PI + angle;
      canvasRotate(angle,arrow.x,arrow.y);
      for(var j = 0; j < arrowData.length; j++)
      {
        if(arrowData[j].drawln)ctx.lineTo(arrowData[j].x + arrow.x,arrowData[j].y + arrow.y);
        else                   ctx.moveTo(arrowData[j].x + arrow.x,arrowData[j].y + arrow.y);
      }
      canvasRotate(-angle,arrow.x,arrow.y);
    }
    else
    {
      ctx.moveTo(arrow.x - 9,arrow.y - 9);
      ctx.lineTo(arrow.x + 9,arrow.y + 9);
      ctx.moveTo(arrow.x + 9,arrow.y - 9);
      ctx.lineTo(arrow.x - 9,arrow.y + 9);
    }
    ctx.stroke();
  }
}

function addObj(cTeam,obj,orgx,orgy,dstx,dsty)
{
  orgx = Math.floor(orgx);
  orgy = Math.floor(orgy);
  dstx = Math.floor(dstx);
  dsty = Math.floor(dsty);
  newObj = team[cTeam].objs[team[cTeam].objs.length] = 
  {
    data:obj.data,
    name:obj.name,
    speed:obj.speed,
    fuel:obj.fuel,
    attack:obj.attack,
    range:obj.range,
    health:obj.health,
    angle:obj.angle,
    x:orgx,
    y:orgy,
    destx:dstx,
    desty:dsty,
    originx:orgx,
    originy:orgy
  };
  
  if(obj.name === "ICBM")
  {
    newObj.fuel = Math.abs(dstx - orgx);
  }
  else if(obj.name === "LRng. Bomber")
  {
    newObj.fuel = Math.max(Math.abs(dstx - orgx) * newObj.speed * 6, Math.abs(dsty - orgy) * newObj.speed * 6);
  }
  else if(obj.name === "Satellite")
  {
         if(newObj.destx === 1)newObj.x -= Math.PI * 64;
    else if(newObj.destx === 2)newObj.x += Math.PI * 64;
    else if(newObj.desty === 1)newObj.y -= Math.PI * 64;
    else if(newObj.desty === 2)newObj.y += Math.PI * 64;
  }
  console.log("Created '" + newObj.name + "' at [" + newObj.x + "," + newObj.y + "] with fuel: " + newObj.fuel);
}

function remObj(cTeam,objNum)
{
  console.log("Removed obj '" + team[cTeam].objs[objNum].name + "' from T: " + cTeam + " I: " + objNum);
  team[cTeam].objs.splice(objNum,1);
}

function jetAttack(cTeam,objNum)
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    if(obj.attack > jet.attack)
    {
      obj.attack -= 0.01; //cooldown
      obj.attack = Math.round(obj.attack * 100) / 100;
    }
    else
    {
      //first find the closest object (within the range)
      var closestObj = {obj:null,dist:obj.range};
      for(var t = 0; t < maxTeams; t++)
      {
        if(t !== cTeam)for(var i = 0; i < team[t].objs.length; i++)
        {
          var otherObj = team[t].objs[i];
          if(otherObj.name === "ICBM" || otherObj.name === "Interceptor" || otherObj.name === "LRng. Bomber")
          {
            var distObj = Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y));
            if(distObj < closestObj.dist)
            {
              closestObj.obj = otherObj;
              closestObj.dist = distObj;
            }
          }
        }
      }
      if(closestObj.obj !== null)//shoot gun
      {
        ctx.strokeStyle = "orange";
        ctx.fillStyle   = "orange";
        ctx.beginPath();
        ctx.moveTo(obj.x,obj.y);
        ctx.lineTo(closestObj.obj.x,closestObj.obj.y);
        ctx.stroke();
        closestObj.obj.health -= obj.attack;
        obj.attack++; //start cooldown
      }
    }
  }
}

function jetPersue(cTeam,objNum) //if there is an enemy in range follow him
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var closestObj = {obj:null,dist:obj.range};
    for(var t = 0; t < maxTeams; t++)
    {
      if(t !== cTeam)for(var i = 0; i < team[t].objs.length; i++)
      {
        var otherObj = team[t].objs[i];
        if(otherObj.name === "ICBM" || otherObj.name === "Interceptor" || otherObj.name === "LRng. Bomber")
        {
          var distObj = Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y));
          if(distObj < closestObj.dist)
          {
            closestObj.obj = otherObj;
            closestObj.dist = distObj;
          }
        }
      }
    }
    if(closestObj.obj !== null)//shoot gun
    {
      return {x:Math.floor(closestObj.obj.x),y:Math.floor(closestObj.obj.y)};
    }
    else
    {
      return null;
    }
  }
}

function bomberAttack(cTeam,objNum)
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    if(obj.attack === Math.floor(obj.attack) && obj.attack >= 1) //cooldown + ammo check
    {
      var closestObj = {obj:null,dist:obj.range};
      for(var t = 0; t < maxTeams; t++)
      {
        if(t !== cTeam)for(var i = 0; i < team[t].objs.length; i++)
        {
          var otherObj = team[t].objs[i];
          if(otherObj.name === "Major City" || otherObj.name === "Air Base" || otherObj.name === "Factory" || otherObj.name === "ICBM Silo")
          {
            var distObj = Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y));
            if(distObj < closestObj.dist && distObj > nuke.range)
            {
              closestObj.obj = otherObj;
              closestObj.dist = distObj;
            }
          }
        }
      }
      if(closestObj.obj !== null)//fire nuke
      {
        addObj(cTeam,nuke,Math.floor(obj.x),Math.floor(obj.y),closestObj.obj.x,closestObj.obj.y);
        obj.attack -= 0.001;
        obj.attack = Math.round(obj.attack * 1000) / 1000;
      }
    }
    else if(obj.attack > 0)
    {
      obj.attack -= 0.001;//cooldown
      obj.attack = Math.round(obj.attack * 1000) / 1000;
    }
  }
}

function nukeAttack(cTeam,objNum) //used to find out what obj the nuke hit
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var rangeObj = []; //stores all objs in range of the blast
    for(var t = 0; t < maxTeams; t++)
    {
      for(var i = 0; i < team[t].objs.length; i++)
      {
        var otherObj = team[t].objs[i];
        if(Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y)) <= obj.range)
        {
          rangeObj.push(otherObj);
        }
      }
    }
    for(var d = 0; d < rangeObj.length; d++)
    {
      rangeObj[d].health -= obj.attack;
    }
  }
}

function satAttack(cTeam,objNum)
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    if(obj.attack > sat.attack)
    {
      obj.attack -= 0.01; //cooldown
      obj.attack = Math.round(obj.attack * 100) / 100;
    }
    else
    {
      //first find the closest object (within the range)
      var closestObj = {obj:null,dist:obj.range};
      for(var t = 0; t < maxTeams; t++)
      {
        if(t !== cTeam)for(var i = 0; i < team[t].objs.length; i++)
        {
          var otherObj = team[t].objs[i];
          if(otherObj.name === "ICBM")
          {
            var distObj = Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y));
            if(distObj < closestObj.dist)
            {
              closestObj.obj = otherObj;
              closestObj.dist = distObj;
            }
          }
        }
      }
      if(closestObj.obj !== null)//shoot gun
      {
        ctx.strokeStyle = "orange";
        ctx.fillStyle   = "orange";
        ctx.beginPath();
        ctx.moveTo(obj.x,obj.y);
        ctx.lineTo(closestObj.obj.x,closestObj.obj.y);
        ctx.stroke();
        closestObj.obj.health -= obj.attack;
        obj.attack++; //start cooldown
      }
    }
  }
}

function baseLanding(cTeam,objNum) //collect any aircraft who are on top of the base
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    //first find the closest aircraft on our team(within the range)
    var closestObj = {obj:null,dist:10,objNum:-1};
    for(var i = 0; i < team[cTeam].objs.length; i++)
    {
      var otherObj = team[cTeam].objs[i];
      if(otherObj.destx === obj.x && otherObj.desty === obj.y)
      {
        var distObj = Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y));
        if(distObj < closestObj.dist)
        {
          closestObj.obj = otherObj;
          closestObj.dist = distObj;
          closestObj.objNum = i;
        }
      }
    }
    if(closestObj.obj !== null)
    {
      if(closestObj.obj.name === "Interceptor")
      {
        obj.attack++;
        remObj(cTeam,closestObj.objNum);
      }
      else if(closestObj.obj.name === "LRng. Bomber")
      {
        obj.fuel++;
        remObj(cTeam,closestObj.objNum);
      }
    }
  }
}

function baseDefend(cTeam,objNum) //auto launch jets at enemies
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var closestObj = {obj:null,dist:obj.range};
    for(var t = 0; t < maxTeams; t++)
    {
      if(t !== cTeam)for(var i =0; i < team[t].objs.length; i++)
      {
        var otherObj = team[t].objs[i];
        if(otherObj.name === "ICBM" || otherObj.name === "Interceptor" || otherObj.name === "LRng. Bomber")
        {
          var distObj = Math.sqrt((obj.x - otherObj.x) * (obj.x - otherObj.x) + (obj.y - otherObj.y) * (obj.y - otherObj.y));
          if(distObj < closestObj.dist)
          {
            closestObj.obj = otherObj;
            closestObj.dist = distObj;
          }
        }
      }
    }
    if(closestObj.obj !== null)
    {
      if(obj.speed >= base.speed)//cooldown
      {
        if(obj.attack > 0)//does the base have any jets to launch?
        {
          obj.attack--;
          addObj(cTeam,jet,obj.x,obj.y,Math.floor(closestObj.obj.x),Math.floor(closestObj.obj.y));
          obj.speed = 0;
        }
      }
      else
      {
        obj.speed += 0.01;
      }
    }
    else
    {
      obj.speed = base.speed;
    }
  }
}

function baseLaunch(cTeam,obj,destX,destY,type)
{
  var launchSuccess = false;
  if(obj !== null && obj !== undefined)
  {
    if(type === 0 && obj.attack > 0) //launch jet
    {
      obj.attack--;
      addObj(cTeam,jet,obj.x,obj.y,destX,destY);
      launchSuccess = true;
    }
    else if(type === 1 && obj.fuel > 0) //launch bobmer
    {
      obj.fuel--;
      addObj(cTeam,bomber,obj.x,obj.y,destX,destY);
      launchSuccess = true;
    }
  }
  return launchSuccess;
}

function nukeLaunch(cTeam,obj,destX,destY)
{
  var launchSuccess = false;
  if(obj !== null && obj !== undefined && obj.attack > 0)
  {
    obj.attack--;
    addObj(cTeam,nuke,obj.x,obj.y,destX,destY);
    launchSuccess = true;
  }
  return launchSuccess;
}

function cityProduction(cTeam,objNum)
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var factoryList = [];
    for(var i = 0; i < team[cTeam].objs.length; i++)
    {
      var newObj = team[cTeam].objs[i];
      if(newObj.name === "Factory")
      {
        factoryList.push(newObj);
      }
    }
    for(var j = 0; j < factoryList.length; j++)
    {
      if(obj.speed >= city.speed)
      {
        factoryList[j].fuel++;
      }
    }
    if(obj.speed >= city.speed)
    {
      obj.speed = 0;
    }
    else
    {
      obj.speed += 0.01;
    }
  }
}

function recDeathTime()
{
  for(var t = 0; t < maxTeams; t++)
  {
    var count = 0;
    if(team[t].deathTime.m === 0 && team[t].deathTime.s === 0)
    {
      for(var i = 0; i < team[t].objs.length; i ++)if(team[t].objs[i].name === "Major City")count++;
      if(count === 0)
      {
        team[t].deathTime.m = matchTime.m;
        team[t].deathTime.s = matchTime.s;
        console.log("Team " + t + " time of death - " + matchTime.m + ":" + matchTime.s);
      }
    }
  }
}

function checkGameOver()
{
  var gameOver = 0;
  for(var t = 0; t < maxTeams; t++)
  {
    if(team[t].deathTime.m > 0 || team[t].deathTime.s > 0)gameOver++;
  }
  console.log(gameOver + " of " + maxTeams + " players have no cities!");
  return (gameOver < maxTeams - 1);
}

function findNextTeam() //find the next team that hasn't lost
{
  currentTeam++;
  while(currentTeam < maxTeams && (team[currentTeam].deathTime.m > 0 || team[currentTeam].deathTime.s > 0))
  {
    currentTeam++;
  }
  console.log("Changing current team to: " + currentTeam);
}

function cityDrawLine(cTeam,objNum)
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var factoryList = [];
    for(var i = 0; i < team[cTeam].objs.length; i++)
    {
      var newObj = team[cTeam].objs[i];
      if(newObj.name === "Factory")
      {
        factoryList.push(newObj);
      }
    }
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    for(var j = 0; j < factoryList.length; j++)
    {
      ctx.moveTo(obj.x,obj.y);
      ctx.lineTo(factoryList[j].x,factoryList[j].y);
    }
    ctx.stroke();
  }
}

function factoryBuild(cTeam,obj,request,destX,destY)
{
  var objDest = null;
  var buildSuccess = false;
  var cityList = [];
  if(request >= 0 && request < 3)
  {
    var dist = 20;
    for(var i = 0; i < team[cTeam].objs.length; i++)
    {
      var otherObj = team[cTeam].objs[i];
      var newDist = Math.sqrt((destX - otherObj.x) * (destX - otherObj.x) + (destY - otherObj.y) * (destY - otherObj.y));
      if(otherObj.name === "Air Base" && request < 2 && newDist < dist)
      {
        objDest = otherObj;
        dist = newDist;
      }
      else if(otherObj.name === "ICBM Silo" && request === 2 && newDist < dist)
      {
        objDest = otherObj;
        dist = newDist;
      }
    }
  }
  if(obj !== null && obj !== undefined)
  {
    if(objDest !== null && objDest !== undefined)
    {
      if(request === 0 && obj.fuel >= factCost.jet) //build jet
      {
        obj.fuel -= factCost.jet;
        objDest.attack++;
        buildSuccess = true;
      }
      else if(request === 1 && obj.fuel >= factCost.bomber) //build bomber
      {
        obj.fuel -= factCost.bomber;
        objDest.fuel++;
        buildSuccess = true;
      }
      else if(request === 2 && obj.fuel >= factCost.nuke) //build nuke
      {
        obj.fuel -= factCost.nuke;
        objDest.attack++;
        buildSuccess = true;
      }
    }
    else if(request >= 3 && request <= 6)
    {
      var inRange = false;
      for(var j = 0; j < team[cTeam].objs.length; j++)
      {
        var city = team[cTeam].objs[j];
        if(city.name === "Major City" && 
        Math.sqrt((destX - city.x) * (destX - city.x) + (destY - city.y) * (destY - city.y)) <= city.range)
        {
          inRange = true;
        }
      }
      if(request === 3 && obj.fuel >= factCost.sat && inRange) //build satilite
      {
        obj.fuel -= factCost.sat;
        addObj(cTeam,sat,destX,destY,1,0);
        buildSuccess = true;
      }
      else if(request === 4 && obj.fuel >= factCost.fact && inRange) //build factory
      {
        obj.fuel -= factCost.fact;
        addObj(cTeam,fact,destX,destY,0,0);
        buildSuccess = true;
      }
      else if(request === 5 && obj.fuel >= factCost.base && inRange) //build air base
      {
        obj.fuel -= factCost.base;
        addObj(cTeam,base,destX,destY,0,0);
        buildSuccess = true;
      }
      else if(request === 6 && obj.fuel >= factCost.silo && inRange) //build ICBM Silo
      {
        obj.fuel -= factCost.silo;
        addObj(cTeam,silo,destX,destY,0,0);
        buildSuccess = true;
      }
    }
  }
  return buildSuccess;
}

function factoryDrawLine(cTeam,objNum) //draws the green lines connecting factories to bases and silos
{
  var obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var baseList = [];
    var siloList = [];
    for(var i = 0; i < team[cTeam].objs.length; i++)
    {
      var newObj = team[cTeam].objs[i];
      if(newObj.name ===  "Air Base")baseList.push(newObj);
      if(newObj.name === "ICBM Silo")siloList.push(newObj);
    }
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    for(var b = 0; b < baseList.length; b++)
    {
      ctx.moveTo(obj.x,obj.y);
      ctx.lineTo(baseList[b].x,baseList[b].y);
    }
    for(var s = 0; s < siloList.length; s++)
    {
      ctx.moveTo(obj.x,obj.y);
      ctx.lineTo(siloList[s].x,siloList[s].y);
    }
    ctx.stroke();
  }
}

function menuSelect(cTeam,type,posx,posy) //selects the menuData.obj (the one with the green circle around it)
{
  var dist = 20;
  var obj = null;
  for(var i = 0; i < team[cTeam].objs.length; i++)
  {
    var newObj = team[cTeam].objs[i];
    var newDist = Math.sqrt((newObj.x - posx) * (newObj.x - posx) + (newObj.y - posy) * (newObj.y - posy));
    if(newObj.name === type && newDist < dist)
    {
      obj = newObj;
      dist = newDist;
    }
  }
  menuData.obj = obj;
}

function moveObj(cTeam,objNum)
{
  obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    var prevObj = {x:obj.x,y:obj.y};
    switch(obj.name)
    {
      case "Interceptor":
        if(obj.x < obj.destx)
        {
          obj.x += obj.speed / 10;
          obj.fuel--;
        }
        else if(obj.x > obj.destx)
        {
          obj.x -= obj.speed / 10;
          obj.fuel--;
        }
        if(obj.y < obj.desty)
        {
          obj.y += obj.speed / 10;
          obj.fuel--;
        }
        else if(obj.y > obj.desty)
        {
          obj.y -= obj.speed / 10;
          obj.fuel--;
        }
        if(obj.x < obj.destx + 1 && obj.x > obj.destx)obj.x = Math.floor(obj.x);//Align to destx
        if(obj.y < obj.desty + 1 && obj.y > obj.desty)obj.y = Math.floor(obj.y);//Align to desty
        if(obj.fuel < (Math.abs(obj.x - obj.originx) + Math.abs(obj.y - obj.originy)) * obj.speed)//head back to base if low on fuel
        {
          obj.destx = obj.originx;
          obj.desty = obj.originy;
        }
        if(obj.x === obj.destx && obj.y === obj.desty)//head to a new location if the destination is reached
        {
          var searchObj = jetPersue(cTeam,objNum);
          if(searchObj === null)
          {
            var newJet = {x:-1,y:-1,a:0};
            while(!(newJet.x > 0 && newJet.x < can.w && newJet.y > 0 && newJet.y < can.h))
            {
              newJet.a = Math.floor(Math.random() * jet.range * 2);
              newJet.x = Math.floor(obj.x + jet.range * Math.cos(2 * Math.PI * newJet.a / jet.range * circleDotMult));
              newJet.y = Math.floor(obj.y + jet.range * Math.sin(2 * Math.PI * newJet.a / jet.range * circleDotMult));
            }
            obj.destx = newJet.x;
            obj.desty = newJet.y;
          }
          else
          {
            obj.destx = searchObj.x - 30 + Math.floor(Math.random() * 60);
            obj.desty = searchObj.y - 30 + Math.floor(Math.random() * 60);
          }
        }
        if(obj.fuel <= 0 || obj.health <= 0)
        {
          remObj(cTeam,objNum);
          return;
        }
      break;
      case "LRng. Bomber":
        var jslp = 0;
        if(Math.abs(obj.destx - obj.originx) >= Math.abs(obj.desty - obj.originy))
        {
          jslp = (obj.desty - obj.originy) / (obj.destx - obj.originx);
          if(obj.x < obj.destx)
          {
            obj.fuel--;
            obj.x += obj.speed / 10;
          }
          else if(obj.x > obj.destx)
          {
            obj.fuel--;
            obj.x -= obj.speed / 10;
          }
          obj.y = jslp * (obj.x - obj.originx) + obj.originy;
        }
        else
        {
          jslp = (obj.destx - obj.originx) / (obj.desty - obj.originy);
          if(obj.y < obj.desty)
          {
            obj.fuel--;
            obj.y += obj.speed / 10;
          }
          else if(obj.y > obj.desty)
          {
            obj.fuel--;
            obj.y -= obj.speed / 10;
          }
          obj.x = jslp * (obj.y - obj.originy) + obj.originx;
        }
        if(obj.x > obj.destx - 1 && obj.x < obj.destx + 1 && obj.y > obj.desty - 1 && obj.y < obj.desty + 1)
        {
          obj.destx = obj.originx;
          obj.desty = obj.originy;
          obj.originx = Math.floor(obj.x);
          obj.originy = Math.floor(obj.y);
          console.log("Team " + cTeam + " bomber at " + objNum + " is reversing course");
        }
        if(obj.fuel <= 0 || obj.health <= 0)
        {
          remObj(cTeam,objNum);
          return;
        }
      break;
      case "Satellite": //objs in a sin wave
        if(obj.destx === 1) //move right
        {
          if(obj.x > obj.originx + 64 * Math.PI)obj.destx = 2;
          obj.x += obj.speed / 10;
          obj.y  = obj.originy + Math.sin((obj.x - obj.originx - Math.PI * 64) / 64) * 80;
        }
        else if(obj.destx === 2) //move left
        {
          if(obj.x < obj.originx - 64 * Math.PI)obj.destx = 1;
          obj.x -= obj.speed / 10;
          obj.y  = obj.originy + Math.sin((obj.x - obj.originx - Math.PI * 64) / 64) * -80;
        }
        else if(obj.desty === 1) //move down
        {
          if(obj.y > obj.originy + 64 * Math.PI)obj.desty = 2;
          obj.y += obj.speed / 10;
          obj.x  = obj.originx + Math.sin((obj.y - obj.originy - Math.PI * 64) / 64) * 80;
        }
        else if(obj.desty === 2) //move up
        {
          if(obj.y < obj.originy - 64 * Math.PI)obj.desty = 1;
          obj.y -= obj.speed / 10;
          obj.x  = obj.originx + Math.sin((obj.y - obj.originy - Math.PI * 64) / 64) * -80;
        }
        if(obj.health <= 0)
        {
          remObj(cTeam,objNum);
          return;
        }
      break;
      case "ICBM":
        var trgtDist = Math.abs(obj.originx - obj.destx);
        obj.fuel--;
        var tsp  = {x:obj.originx,y:obj.originy};
        var tcp1 = {x:obj.originx,y:obj.originy - 100};
        var tcp2 = {x:obj.destx,y:obj.desty - Math.min(obj.originy * 2,nukeMaxAlt)};
        var tep  = {x:obj.destx,y:obj.desty};
        var tdp = quadCurve(obj.fuel / trgtDist,tsp,tcp1,tcp2,tep);
        obj.x = tdp.x;
        obj.y = tdp.y;
        if(obj.fuel <= 0 || obj.health <= 0)
        {
          if(obj.health > 0)
          {
            nukeAttack(cTeam,objNum);
            detSound.play();
            addNukeBlast(obj);
          }
          remObj(cTeam,objNum);
          return;
        }
      break;
      default: //remove imobile objs without any health
        if(obj.health <= 0)
        {
          remObj(cTeam,objNum);
          return;
        }
      break;
    }
    var tempAngle = Math.atan2(obj.y - prevObj.y,obj.x - prevObj.x);
    if(tempAngle < 0)tempAngle = 2 * Math.PI + tempAngle;
    obj.angle = tempAngle;
  }
}

function drawInfo(cTeam,objNum)
{
  var dispText = false;
  var dispCirc = false;
  var dispDist = false;
  var obj = team[cTeam].objs[objNum];
  if(currentTeam === cTeam)
  {
    if(obj.name === "Interceptor" && dispInfo.jet)
    {
      dispText = true;
      dispCirc = true;
      dispDist = true;
      ctx.beginPath();
      ctx.moveTo(obj.destx - 2,obj.desty - 2);
      ctx.lineTo(obj.destx + 2,obj.desty + 2);
      ctx.moveTo(obj.destx - 2,obj.desty + 2);
      ctx.lineTo(obj.destx + 2,obj.desty - 2);
      ctx.stroke();
    }
    else if(obj.name === "LRng. Bomber" && dispInfo.bomber)
    {
      dispText = true;
      dispCirc = true;
      dispDist = true;
      var jslp = 0;
      if(Math.abs(obj.destx - obj.originx) >= Math.abs(obj.desty - obj.originy))
      {
        jslp = (obj.desty - obj.originy) / (obj.destx - obj.originx);
        var lineX = 0;
        if(obj.originx < obj.destx)
        {
          for(lineX = obj.originx; lineX < obj.destx; lineX++)
          {
            if(lineX % 3 !== 0)
            {
              ctx.fillRect(lineX,jslp * (lineX - obj.originx) + obj.originy,1,1);
            }
          }
        }
        else if(obj.originx > obj.destx)
        {
          for(lineX = obj.originx; lineX > obj.destx; lineX--)
          {
            if(lineX % 3 !== 0)
            {
              ctx.fillRect(lineX,jslp * (lineX - obj.originx) + obj.originy,1,1);
            }
          }
        }
      }
      else
      {
        jslp = (obj.destx - obj.originx) / (obj.desty - obj.originy);
        var lineY = 0;
        if(obj.originy < obj.desty)
        {
          for(lineY = obj.originy; lineY < obj.desty; lineY++)
          {
            if(lineY % 3 !== 0)
            {
              ctx.fillRect(jslp * (lineY - obj.originy) + obj.originx,lineY,1,1);
            }
          }
        }
        else if(obj.originy > obj.desty)
        {
          for(lineY = obj.originy; lineY > obj.desty; lineY--)
          {
            if(lineY % 3 !== 0)
            {
              ctx.fillRect(jslp * (lineY - obj.originy) + obj.originx,lineY,1,1);
            }
          }
        }
      }
    }
    else if(obj.name === "Satellite" && dispInfo.sat)
    {
      dispText = true;
      dispCirc = true;
      if(obj.destx > 0)
      {
        for(var plotX = obj.originx; plotX < obj.originx + 128 * Math.PI; plotX++)
        {
          if(plotX % 3 !== 0)
          {
            ctx.fillRect(plotX - Math.PI * 64,obj.originy + Math.sin((plotX - obj.originx - Math.PI * 64) / 64) *  80,1,1);
            ctx.fillRect(plotX - Math.PI * 64,obj.originy + Math.sin((plotX - obj.originx - Math.PI * 64) / 64) * -80,1,1);
          }
        }
      }
      else if(obj.desty > 0)
      {
        for(var plotY = obj.originy; plotY < obj.originy + 128 * Math.PI; plotY++)
        {
          if(plotY % 3 !== 0)
          {
            ctx.fillRect(obj.originx + Math.sin((plotY - obj.originy - Math.PI * 64) / 64) *  80,plotY - Math.PI * 64,1,1);
            ctx.fillRect(obj.originx + Math.sin((plotY - obj.originy - Math.PI * 64) / 64) * -80,plotY - Math.PI * 64,1,1);
          }
        }
      }
    }
    else if(obj.name === "ICBM" && dispInfo.nuke)
    {
      dispText = true;
      dispCirc = true;
      dispDist = true;
      var sp  = {x:obj.originx,y:obj.originy};
      var cp1 = {x:obj.originx,y:obj.originy - 100};
      var cp2 = {x:obj.destx,y:obj.desty - Math.min(obj.originy * 2,nukeMaxAlt)};
      var ep  = {x:obj.destx,y:obj.desty};
      var arcDist = Math.abs(obj.originx - obj.destx);
      for(var arcX = 0; arcX < arcDist; arcX++)
      {
        if(arcX % 3 !== 0)
        {
          var dp = quadCurve(arcX / arcDist,sp,cp1,cp2,ep);
          ctx.fillRect(dp.x,dp.y,1,1);
        }
      }
    }
    else if(obj.name === "Air Base"   && dispInfo.base)
    {
      dispText = true;
      dispCirc = true;
    }
    else if(obj.name === "Major City")
    {
      dispText = true;
      if(menuData.m === 3 && menuData.a >= 11 && menuData.a <= 14)dispCirc = true;
    }
    else if((obj.name === "Factory"    && dispInfo.fact)
         || (obj.name === "ICBM Silo"  && dispInfo.silo))
    {
      
      dispText = true;
    }
    else
    {
      console.log("Unknown obj: '" + obj.name + "'");
    }
  }
  
  if(dispCirc)
  {
    if(obj.name === "Major City")ctx.fillStyle = "lime";
    var circPlot = {x:0,y:0};
    for(var circ = 0; circ < obj.range; circ++)
    {
      circPlot.x = obj.x + obj.range * Math.cos(2 * Math.PI * circ / obj.range * circleDotMult);
      circPlot.y = obj.y + obj.range * Math.sin(2 * Math.PI * circ / obj.range * circleDotMult);
      ctx.fillRect(circPlot.x,circPlot.y,1,1);
    }
    ctx.fillStyle = team[cTeam].color;
  }
  
  ctx.fillStyle = team[cTeam].color;
  ctx.font = "11px Monospace";
  if(dispText)
  {
    ctx.textAlign = "left";
    ctx.fillText("H: " + obj.health,obj.x + 11,obj.y - 3);
    if(obj.fuel < 0)
    {
      ctx.fillText("F: ---",obj.x + 11,obj.y + 5);
    }
    else
    {
      ctx.fillText("F: " + obj.fuel,obj.x + 11,obj.y + 5);
    }
    if(obj.attack < 0)
    {
      ctx.fillText("A: ---",obj.x + 11,obj.y + 13);
    }
    else
    {
      ctx.fillText("A: " + obj.attack,obj.x + 11,obj.y + 13);
    }
  }
  if(dispInfo.basic || dispText)
  {
    ctx.textAlign = "center";
    ctx.fillText(obj.name,obj.x,obj.y - 11);
    ctx.textAlign = "right";
    ctx.fillText(Math.floor(obj.x) + " :X",obj.x - 11,obj.y - 3);
    ctx.fillText(Math.floor(obj.y) + " :Y",obj.x - 11,obj.y + 5);
    if(dispDist)
    {
      ctx.fillText(Math.floor(Math.sqrt((obj.x - obj.destx) * (obj.x - obj.destx) + //continued on next line
      (obj.y - obj.desty) * (obj.y - obj.desty))) + " :D",obj.x - 11,obj.y + 13);
    }
    else
    {
      ctx.fillText("--- :D",obj.x - 11,obj.y + 13);
    }
  }
}

function drawObj(cTeam,objNum)
{
  obj = team[cTeam].objs[objNum];
  if(obj !== null && obj !== undefined)
  {
    ctx.strokeStyle = team[cTeam].color;
    ctx.fillStyle   = team[cTeam].color;
    if(cinematic || gameHalt)drawInfo(cTeam,objNum);
    canvasRotate(obj.angle,obj.x,obj.y);
    ctx.beginPath();
    if(obj.name === "Major City")
    {
      ctx.arc(obj.x,obj.y,obj.data,0,2 * Math.PI);
    }
    else
    {
      for(var i = 0; i < obj.data.length; i++)
      {
        if(obj.data[i].drawln)
        {
          ctx.lineTo(obj.data[i].x + obj.x,obj.data[i].y + obj.y);
        }
        else
        {
          ctx.moveTo(obj.data[i].x + obj.x,obj.data[i].y + obj.y);
        }
      }
    }
    ctx.stroke();
    canvasRotate(-obj.angle,obj.x,obj.y);
  }
}

function drawNukeBlast(radius,posX,posY)
{
  ctx.fillStyle = "orange";
  ctx.strokeStyle = "orange";
  ctx.beginPath();
  ctx.arc(posX,posY,radius,0,2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  return radius - 0.1;
}

function remNukeBlast(nukeNum)
{
  nukeBlastList.splice(nukeNum,1);
}

function addNukeBlast(obj)
{
  nukeBlastList[nukeBlastList.length] = {x:obj.x,y:obj.y,r:obj.range};
}

//=== bezier curve ===
function B1(t) { return t * t * t; }
function B2(t) { return 3 * t * t * (1 - t); }
function B3(t) { return 3 * t * (1 - t) * (1 - t); }  
function B4(t) { return (1 - t) * (1 - t) * (1 - t); }  
function quadCurve(percent,C1,C2,C3,C4)
{  
  var pos = {x:0,y:0};
  pos.x = C1.x * B1(percent) + C2.x * B2(percent) + C3.x * B3(percent) + C4.x * B4(percent);  
  pos.y = C1.y * B1(percent) + C2.y * B2(percent) + C3.y * B3(percent) + C4.y * B4(percent);  
  return pos;
}
//===

function saveGame(game)
{
  localStorage.setItem(game + "gameData",
    maxTeams + "&" +
    currentTeam + "&" +
    citiesCount + "&" +
    gameHalt + "&" +
    matchTime.m  + "&" +
    matchTime.s  + "&" +
    matchTime.sm + "&" +
    matchTime.ss
  );
  for(var t = 0; t < maxTeams; t++)
  {
    var objString = "";
    for(var i = 0; i < team[t].objs.length; i++)
    {
      objString += 
      team[t].objs[i].name + "#" +
      team[t].objs[i].speed + "#" +
      team[t].objs[i].fuel + "#" +
      team[t].objs[i].attack + "#" +
      team[t].objs[i].range + "#" +
      team[t].objs[i].health + "#" +
      team[t].objs[i].angle + "#" +
      team[t].objs[i].x + "#" +
      team[t].objs[i].y + "#" +
      team[t].objs[i].originx + "#" +
      team[t].objs[i].originy + "#" +
      team[t].objs[i].destx + "#" +
      team[t].objs[i].desty + "&";
    }
    objString = objString.substring(0,objString.length - 1);
    localStorage.setItem(game + "team" + t,
      team[t].name + "&" +
      team[t].color + "&" +
      team[t].deathTime.m + "&" +
      team[t].deathTime.s + "&" + 
      team[t].nation.x + "&" +
      team[t].nation.y + "&" +
      team[t].launchCode + "&" +
      objString
    );
  }
}

function loadGame(game)
{
  var temp = localStorage.getItem(game + "gameData");
  var match = temp.split("&");
  gameHalt = (match[3] === "true");
  matchTime.m  = parseInt(match[4]);
  matchTime.s  = parseInt(match[5]);
  matchTime.sm = parseInt(match[6]);
  matchTime.ss = parseInt(match[7]);
  for(var t = 0; t < maxTeams; t++)
  {
    temp = localStorage.getItem(game + "team" + t);
    var dTeam = temp.split("&");
    team[t].name = dTeam[0];
    team[t].color = dTeam[1];
    team[t].deathTime.m = parseInt(dTeam[2]);
    team[t].deathTime.s = parseInt(dTeam[3]);
    team[t].nation.x = parseInt(dTeam[4]);
    team[t].nation.y = parseInt(dTeam[5]);
    team[t].launchCode = dTeam[6];
    for(var i = 7; i < dTeam.length; i ++)
    {
      var jTeam = dTeam[i].split("#");
      var lng = team[t].objs.push({
        data:[],
        name:jTeam[0],
        speed:parseInt(jTeam[1]),
        fuel:parseInt(jTeam[2]),
        attack:parseInt(jTeam[3]),
        range:parseInt(jTeam[4]),
        health:parseInt(jTeam[5]),
        angle:parseInt(jTeam[6]),
        x:parseInt(jTeam[7]),
        y:parseInt(jTeam[8]),
        destx:parseInt(jTeam[9]),
        desty:parseInt(jTeam[10]),
        originx:parseInt(jTeam[11]),
        originy:parseInt(jTeam[12])
      });
      var objName = team[t].objs[lng - 1].name;
           if(objName === "Interceptor" )team[t].objs[lng - 1].data = jet.data;
      else if(objName === "LRng. Bomber")team[t].objs[lng - 1].data = bomber.data;
      else if(objName === "ICBM"        )team[t].objs[lng - 1].data = nuke.data;
      else if(objName === "Satellite"   )team[t].objs[lng - 1].data = sat.data;
      else if(objName === "Major City"  )team[t].objs[lng - 1].data = city.data;
      else if(objName === "Factory"     )team[t].objs[lng - 1].data = fact.data;
      else if(objName === "Air Base"    )team[t].objs[lng - 1].data = base.data;
      else if(objName === "ICBM Silo"   )team[t].objs[lng - 1].data = silo.data;
    }
  }
  console.log("Game " + game + " Loaded!");
}

function addNation(cTeam,angle,posx,posy)
{
  angle -= Math.PI;
  addObj(cTeam,fact,posx,posy,0,0);
  for(var i = 0; i < citiesCount; i ++)
  {
    addObj(cTeam,city,posx + Math.cos(angle) * city.range,posy + Math.sin(angle) * city.range,0,0);
    angle += 2 * Math.PI / citiesCount;
  }
}

function drawMObj(cTeam,obj,offx,offy) //draws green circle arround menuData.obj
{
  ctx.strokeStyle = team[cTeam].color;
  ctx.beginPath();
  if(obj.name === "Major City")
  {
    ctx.arc(menuData.x + offx,menuData.y + offy,obj.data,0,2 * Math.PI);
  }
  else
  {
    for(i = 0; i < obj.data.length; i++)
    {
      if(obj.data[i].drawln)
      {
        ctx.lineTo(obj.data[i].x + menuData.x + offx,obj.data[i].y + menuData.y + offy);
      }
      else
      {
        ctx.moveTo(obj.data[i].x + menuData.x + offx,obj.data[i].y + menuData.y + offy);
      }
    }
  }
  ctx.stroke();
}

function drawMbox(cTeam,w,h)
{
  ctx.strokeStyle = team[cTeam].color;
  ctx.beginPath();
  ctx.moveTo(0,menuData.y);
  ctx.lineTo(can.w,menuData.y);
  ctx.moveTo(menuData.x,0);
  ctx.lineTo(menuData.x,can.h);
  ctx.stroke();
  ctx.fillStyle = "black";
  ctx.fillRect(menuData.x,menuData.y - 10,w,h + 10);
  ctx.fillStyle = team[cTeam].color;
  ctx.beginPath();
  ctx.rect(menuData.x, menuData.y, w, h);
  for(var i = 0; i < w / 5 - 1; i++)
  {
    ctx.moveTo((menuData.x + 2) + i * 5, menuData.y + 6);
    ctx.lineTo((menuData.x + 6) + i * 5, menuData.y + 2);
    ctx.moveTo((menuData.x + 2) + i * 5, (menuData.y + h) - 2);
    ctx.lineTo((menuData.x + 6) + i * 5, (menuData.y + h) - 6);
  }
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillText(menuData.t,menuData.x + 1,menuData.y - 2);
  ctx.fillStyle = "black";
  ctx.fillRect(menuData.x - 18,menuData.y - 18,18,18);
  ctx.fillStyle = team[cTeam].color;
  drawXbox(menuData.x - 18,menuData.y - 18,18,18);
}

function drawXbox(x,y,w,h)
{
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x + w,y);
  ctx.lineTo(x + w,y + h);
  ctx.lineTo(x,y + h);
  ctx.lineTo(x,y);
  ctx.moveTo(x + 2,y + 2);
  ctx.lineTo(x + w - 2,y + h - 2);
  ctx.moveTo(x + w - 2,y + 2);
  ctx.lineTo(x + 2,y + h - 2);
  ctx.stroke();
}

function clickCheck(x,y,w,h)
{
  return (mouse.x > x && mouse.y > y && mouse.x < x + w && mouse.y < y + h);
}

function canvasRotate(angle,posX,posY)
{
  ctx.translate(posX,posY);
  ctx.rotate(angle);
  ctx.translate(-posX,-posY);
}

c.onclick = function(e)
{
  if(gameHalt)
  {
    var left = (window.pageXOffset || c.scrollLeft) - (c.clientLeft || 0);
    var top  = (window.pageYOffset || c.scrollTop)  - (c.clientTop || 0) + 64;
    var refx = currentTeam * 128;
    if(clickCheck(left + refx,top + 32,128,32))//next player turn
    {
      findNextTeam();
      menuData.m = 0;
      matchTime.sm = turnTime.m;
      matchTime.ss = turnTime.s;
      if(currentTeam >= maxTeams)
      {
        gameHalt = false;
        currentTeam = 0;
        matchTime.sm = gameTime.m;
        matchTime.ss = gameTime.s;
      }
    }
    else if(clickCheck(menuData.x - 18,menuData.y - 18,18,18) && menuData.m > 0)
    {
      if(menuData.m > 1)
      {
        menuData.w = menuStat[1].w;
        menuData.h = menuStat[1].h;
        menuData.t = menuStat[1].t;
        menuData.obj = null;
        menuData.m = 1;
        menuData.a = 0;
      }
      else menuData.m = 0;
    }
    else if(menuData.m === 0)//no menu
    {
      menuData.x = mouse.x;
      menuData.y = mouse.y;
      menuData.w = menuStat[1].w;
      menuData.h = menuStat[1].h;
      menuData.t = menuStat[1].t;
      menuData.obj = null;
      menuData.m = 1;
      menuData.a = 0;
      console.log("Opened menu at: " + menuData.x + "," + menuData.y);
    }
    else if(menuData.m === 1)//main menu
    {
      if(clickCheck(menuData.x + 3,menuData.y + 10,16,16))
      {
        menuData.a = 1;
        if(menuData.obj !== null && menuData.obj.name !== "Air Base")menuData.obj = null;
      }
      else if(clickCheck(menuData.x + 23,menuData.y + 10,16,16))
      {
        if(team[currentTeam].launchCode === "")
        {
          menuData.a = 2;
          if(menuData.obj !== null && menuData.obj.name !== "Air Base")menuData.obj = null;
        }
        else
        {
          menuData.w = menuStat[2].w;
          menuData.h = menuStat[2].h;
          menuData.t = menuStat[2].t;
          menuData.obj = null;
          menuData.m = 2;
          menuData.a = 0;
        }
      }
      else if(clickCheck(menuData.x + 45,menuData.y + 10,16,16))
      {
        if(team[currentTeam].launchCode === "")
        {
          menuData.a = 3;
          if(menuData.obj !== null && menuData.obj.name !== "ICBM Silo")menuData.obj = null;
        }
        else
        {
          menuData.obj = null;
          menuData.w = menuStat[2].w;
          menuData.h = menuStat[2].h;
          menuData.t = menuStat[2].t;
          menuData.m = 2;
          menuData.a = 0;
        }
      }
      else if(clickCheck(menuData.x + 72,menuData.y + 10,16,16))
      {
        menuData.w = menuStat[3].w;
        menuData.h = menuStat[3].h;
        menuData.t = menuStat[3].t;
        menuData.obj = null;
        menuData.m = 3;
        menuData.a = 0;
      }
      else if(clickCheck(menuData.x + 96,menuData.y + 10,16,16))
      {
        menuData.w = menuStat[4].w;
        menuData.h = menuStat[4].h;
        menuData.t = menuStat[4].t;
        menuData.obj = null;
        menuData.m = 4;
        menuData.a = 0;
      }
      else if(menuData.a === 1 || menuData.a === 2)//launch jet or bomber
      {
        menuSelect(currentTeam,"Air Base",mouse.x,mouse.y);
        if(menuData.obj === null)
        {
          menuData.a = 0;
        }
        else
        {
          menuData.a += 3;
        }
      }
      else if(menuData.a === 3)
      {
        menuSelect(currentTeam,"ICBM Silo",mouse.x,mouse.y);
        if(menuData.obj === null)
        {
          menuData.a = 0;
        }
        else
        {
          menuData.a += 3;
        }
      }
      else if(menuData.a === 4 || menuData.a === 5)
      {
        if(!baseLaunch(currentTeam,menuData.obj,mouse.x,mouse.y,menuData.a - 4))
        {
          menuData.obj = null;
          menuData.a = 0;
        }
      }
      else if(menuData.a === 6)
      {
        if(!nukeLaunch(currentTeam,menuData.obj,mouse.x,mouse.y))
        {
          menuData.obj = null;
          menuData.a = 0;
        }
      }
      else
      {
        menuData.obj = null;
        menuData.a = 0;
      }
    }
    else if(menuData.m === 2)//nuke launch code menu
    {
      //mouse is not needed for this menu
    }
    else if(menuData.m === 3)//build menu
    {
      //factory already selected
           if(clickCheck(menuData.x + 3,  menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 8;
      else if(clickCheck(menuData.x + 23, menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 9;
      else if(clickCheck(menuData.x + 45, menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 10;
      else if(clickCheck(menuData.x + 72, menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 11;
      else if(clickCheck(menuData.x + 96, menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 12;
      else if(clickCheck(menuData.x + 120,menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 13;
      else if(clickCheck(menuData.x + 144,menuData.y + 10,16,16) && menuData.obj !== null)menuData.a = 14;
      //factory not already selected
      else if(clickCheck(menuData.x + 3,  menuData.y + 10,16,16))menuData.a = 1;
      else if(clickCheck(menuData.x + 23, menuData.y + 10,16,16))menuData.a = 2;
      else if(clickCheck(menuData.x + 45, menuData.y + 10,16,16))menuData.a = 3;
      else if(clickCheck(menuData.x + 72, menuData.y + 10,16,16))menuData.a = 4;
      else if(clickCheck(menuData.x + 96, menuData.y + 10,16,16))menuData.a = 5;
      else if(clickCheck(menuData.x + 120,menuData.y + 10,16,16))menuData.a = 6;
      else if(clickCheck(menuData.x + 144,menuData.y + 10,16,16))menuData.a = 7;
      else if(menuData.a > 0 && menuData.a <= 7)
      {
        menuSelect(currentTeam,"Factory",mouse.x,mouse.y);
        if(menuData.obj === null)
        {
          menuData.a = 0;
        }
        else
        {
          menuData.a += 7;
        }
      }
      else if(menuData.a > 7 && !factoryBuild(currentTeam,menuData.obj,menuData.a - 8,mouse.x,mouse.y))
      {
        menuData.obj = null;
        menuData.a = 0;
      }
    }
    else if(menuData.m === 4)//toggle info menu
    {
           if(clickCheck(menuData.x + 3,  menuData.y + 10,16,16))dispInfo.basic  = !dispInfo.basic;
      else if(clickCheck(menuData.x + 23, menuData.y + 10,16,16))dispInfo.jet    = !dispInfo.jet;
      else if(clickCheck(menuData.x + 45, menuData.y + 10,16,16))dispInfo.bomber = !dispInfo.bomber;
      else if(clickCheck(menuData.x + 72, menuData.y + 10,16,16))dispInfo.nuke   = !dispInfo.nuke;
      else if(clickCheck(menuData.x + 96, menuData.y + 10,16,16))dispInfo.sat    = !dispInfo.sat;
      else if(clickCheck(menuData.x + 120,menuData.y + 10,16,16))dispInfo.city   = !dispInfo.city;
      else if(clickCheck(menuData.x + 144,menuData.y + 10,16,16))dispInfo.fact   = !dispInfo.fact;
      else if(clickCheck(menuData.x + 168,menuData.y + 10,16,16))dispInfo.base   = !dispInfo.base;
      else if(clickCheck(menuData.x + 192,menuData.y + 10,16,16))dispInfo.silo   = !dispInfo.silo;
    }
  }
};

ambient.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

onkeydown = function(e)
{
    e = e || event; // to deal with IE
    if(e.keyCode >= 48 && e.keyCode <= 57 && launchCodeAttempt.length < 10)launchCodeAttempt += (e.keyCode - 48);
    if(e.keyCode === 8)launchCodeAttempt = launchCodeAttempt.substr(0,launchCodeAttempt.length - 1);
    if(e.keyCode === 27)menuData.m = 0;
};

function getURIVar(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++)
  {
    var pair = vars[i].split("=");
    if(pair[0] == variable)
    {
      return pair[1];
    }
  } 
  return null;
}

onmousemove = function(e)
{
  mouse.x = e.pageX - 8;
  mouse.y = e.pageY - 8;
};