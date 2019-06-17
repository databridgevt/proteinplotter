// jshint esversion:6
let data;
let layout;
let numOfResiduesl;
let xpmFiles;
let xpmAxes;
let reader;
let fileNum;
let graphType;
let plot;
let coilColor;
let helixColor;
let sheetColor;
let titleFontFam;
let titleFontSize;
let titleFontColor;
let xFontFam;
let xFontSize;
let xFontColor;



// Methods to extract data from xpm files
function getXpmFiles(newgraphType) {
  //Global Variable initiation every new plot
  numOfResidues = null;
  xpmFiles = [];
  xpmAxes = [];
  reader = new FileReader();
  fileNum = 0;
  graphType = newgraphType;

  let inputID;
  if (graphType == "line-time") {
    inputID = "time-files";
  } else if (graphType == "line-res") {
    inputID = "res-files";
  } else if (graphType == "colormap") {
    inputID = "colormap-files";
  }
  xpmAxes = [];
  xpmFiles = document.getElementById(inputID).files;
  reader.onload = function(e) {
    populateXpmAxes(xpmFiles.length, e);
  };
  reader.readAsText(xpmFiles[0]);
}

function makeXpmKey(fileLines) {
  let xpmKey = {
    cbt: [],
    helix: [],
    sheet: []
  };
  for (var lineNum = 0; lineNum < fileLines.length; lineNum++) {
    let line = fileLines[lineNum];
    if (line[0] == '"' && line.slice(line.length - 3, line.length).toString() == '*/,') {
      let structureName = line.split('"')[3];
      let structureSymbol = line.split('"')[1][0];
      if (structureName.includes("Coil") || structureName.includes("Bend") || structureName.includes("Turn")) {
        xpmKey.cbt.push(structureSymbol);
      } else if (structureName.includes("B-")) {
        xpmKey.sheet.push(structureSymbol);
      } else if (structureName.includes("-Helix")) {
        xpmKey.helix.push(structureSymbol);
      }
    }
    //Dont read the rest of the file in this method
    if (line.split(":")[0] == "/* x-axis") {
      break;
    }
  }
  return xpmKey;
}

function populateXpmAxes(totalFiles, e) {
  xpmAxes.push([]);
  let yDataReached = false;
  let fileLines = e.target.result.split("\n");
  let xpmKey = makeXpmKey(fileLines);
  let resLineCount = 0;
  // Populate xpmAxes
  for (var lineNum = 0; lineNum < fileLines.length; lineNum++) {
    let line = fileLines[lineNum];
    // Everything after the yAxis line is yData and should be added to xpmAxes
    if (yDataReached) {
      let lineArr = line.split("");
      //TODO the last residues has one less time value than the rest. print xpmAxes after populating to see.
      if (resLineCount < numOfResidues - 1) {
        xpmAxes[fileNum].push(lineArr.slice(1, lineArr.length - 2));
      } else if (resLineCount == numOfResidues - 1) {
        xpmAxes[fileNum].push(lineArr.slice(1, lineArr.length - 1));
      }
      resLineCount += 1;
    }
    //Find yData and numOfResidues count
    if (line.split(":")[0] == "/* y-axis") {
      let yAxisLineArray = line.split(" ");
      numOfResidues = Number(yAxisLineArray[yAxisLineArray.length - 2]);
      yDataReached = true;
    }
  }
  // Clean xpmAxes by changing all values to "cbt", "helix" or "sheet"
  for (var resNum = 0; resNum < xpmAxes[fileNum].length; resNum++) {
    for (var time = 0; time < xpmAxes[fileNum][resNum].length; time++) {
      let structure = xpmAxes[fileNum][resNum][time];
      if (xpmKey.cbt.includes(structure)) {
        xpmAxes[fileNum][resNum][time] = "cbt";
      } else if (xpmKey.helix.includes(structure)) {
        xpmAxes[fileNum][resNum][time] = "helix";
      } else if (xpmKey.sheet.includes(structure)) {
        xpmAxes[fileNum][resNum][time] = "sheet";
      }
    }
  }
  fileNum += 1;
  if (fileNum < totalFiles) {
    reader.readAsText(xpmFiles[fileNum]);
  } else if (fileNum == totalFiles) {
    switch (graphType) {
      case "line-time":
        plotLines("time");
        break;
      case "line-res":
        plotLines("res");
        break;
      case "colormap":
        plotColorMap();
        break;
      default:

    }
  }
}

//========== COLOR MAP ==========
function plotColorMap() {
  let axes = makeColorAxes();
  let colorArr = [];
  for (let resNum = 0; resNum < axes.length; resNum++) {
    colorArr.push([]);
    let epochPercents = [];
    for (let time = 0; time < axes[0].length; time++) {
      epochPercents.push(axes[resNum][time]);
      if (time % 100 == 0) {
        colorArr[resNum].push(calcRgb(averageArr(epochPercents)));
        epochPercents = [];
      }
    }
  }
  let plotTable = document.getElementById("plot-table");
  plotTable.innerHTML = "";
  for (var resNum = 0; resNum < colorArr.length; resNum++) {
    let newRow = document.createElement("tr");
    let newCell = document.createElement("td");
    newCell.setAttribute("class", "data-cell");
    newCell.setAttribute("id", "res-row-" + resNum);
    newCell.innerHTML = ""+(resNum+1);
    newRow.appendChild(newCell);
    for (var time = 0; time < colorArr[0].length; time++) {
      newCell = document.createElement("td");
      newCell.setAttribute("class", "data-cell");
      newCell.setAttribute("id", "cell-" + resNum + "-" + time);
      newCell.style.backgroundColor = colorArr[resNum][time];
      newCell.style.height = "15px";
      newCell.style.width = "1px";
      newRow.appendChild(newCell);
    }
    plotTable.appendChild(newRow);
  }

  // X-Axis Labels
  let newRow = document.createElement("tr");
  for (var x = 0; x < colorArr[0].length; x++) {
    let newCell = document.createElement("td");
    newCell.setAttribute("class", "data-cell");
    newCell.setAttribute("id", "cell-xaxis-" + x);
    newCell.style.borderRight = "1px solid black";
    newCell.style.borderLeft = "1px solid black";
    newCell.style.height = "15px";
    newCell.style.width = "1px";
    newCell.style.overflow = "scroll";
    if (x % 100 == 0) {
      newCell.innerHTML = x + "ns";
    }
    newRow.appendChild(newCell);
  }
  plotTable.appendChild(newRow);
}

function averageArr(arr) {
  let avgC = 0;
  let avgH = 0;
  let avgS = 0;
  let total = arr.length;
  for (let i = 0; i < total; i++) {
    avgC += arr[i][0];
    avgH += arr[i][1];
    avgS += arr[i][2];
  }
  avgC = avgC / total;
  avgH = avgH / total;
  avgS = avgS / total;
  return [avgC, avgH, avgS];
}


rgb_ryb();
const RGB_MAX = 384;

function calcRgb(percents) {
  let ryb = chs2ryb(percents[1], percents[0], percents[2]);
  let r = ryb[0];
  let y = ryb[1];
  let b = ryb[2];
  let color = new RgbRyb();

  color.setRyb(r, y, b);
  return color.getRgbText();
}

function makeColorAxes() {
  let axes = [];
  let res = 0;
  let chainSepCount = 0;
  while (res < xpmAxes[0].length) {
    if (xpmAxes[0][res][0] == "=") {
      for (let fileNum = 0; fileNum < xpmAxes.length; fileNum++) {
        xpmAxes[fileNum].splice(res, 1);
      }
      chainSepCount++;
      continue;
    }
    axes.push([]);
    for (let time = 0; time < xpmAxes[0][0].length; time++) {
      let c = 0;
      let h = 0;
      let s = 0;
      for (let fileNum = 0; fileNum < xpmAxes.length; fileNum++) {
        switch (xpmAxes[fileNum][res][time]) {
          case "cbt":
            c += 1;
            break;
          case "helix":
            h += 1;
            break;
          case "sheet":
            s += 1;
            break;
          default:
        }
      }
      c = c / (xpmAxes.length);
      h = h / (xpmAxes.length);
      s = s / (xpmAxes.length);
      axes[res].push([c, h, s]);
    }
    res++;
  }
  let strands = [];
  for (let i = 0; i < axes.length; i += axes.length / (chainSepCount + 1)) {
    strands.push(axes.slice(i, i + axes.length / (chainSepCount + 1)));
  }
  let avgAxes = [];
  for (let res = 0; res < strands[0].length; res++) {
    avgAxes.push([]);
    for (let time = 0; time < strands[0][0].length; time++) {
      avgAxes[res].push([]);
      let avgC = 0;
      let avgH = 0;
      let avgS = 0;
      for (let strandNum = 0; strandNum < strands.length; strandNum++) {
        avgC += strands[strandNum][res][time][0];
        avgH += strands[strandNum][res][time][1];
        avgS += strands[strandNum][res][time][2];
      }
      avgC = avgC / strands.length;
      avgH = avgH / strands.length;
      avgS = avgS / strands.length;
      avgAxes[res][time] = [avgC, avgH, avgS];
    }

  }
  return avgAxes;
}

//========== LINE PLOT ===========
function plotLines() {
  let plotArea = document.getElementById('plot');
  plotArea.innerHTML = "";
  let axes;
  let plotTitle;
  let avgStrands;

  switch (graphType) {
    case "line-time":
      plotTitle = document.getElementById("time-plot-title").value;
      avgStrands = document.getElementById("time-avg-strands").checked;
      coilColor = document.getElementById("time-coil-color").value;
      helixColor = document.getElementById("time-helix-color").value;
      sheetColor = document.getElementById("time-sheet-color").value;
      axes = makeTimeAxes(avgStrands);
      break;
    case "line-res":
      plotTitle = document.getElementById("res-plot-title").value;
      avgStrands = document.getElementById("res-avg-strands").checked;
      coilColor = document.getElementById("res-coil-color").value;
      helixColor = document.getElementById("res-helix-color").value;
      sheetColor = document.getElementById("res-sheet-color").value;
      axes = makeResidueAxes(avgStrands);
      break;
    default:

  }
  let xAxis = axes[0];
  let yAxes = axes[1];
  let cbtLine = {
    x: xAxis,
    y: yAxes[0],
    mode: "lines",
    name: "Coil, Bend or Turn",
    line: {
      color: coilColor,
      width: 2
    }
  };
  let sheetLine = {
    x: xAxis,
    y: yAxes[1],
    mode: "lines",
    name: "	\u03B1-Helix",
    line: {
      color: helixColor,
      width: 2
    }
  };
  let helixLine = {
    x: xAxis,
    y: yAxes[2],
    mode: "lines",
    name: "	\u03B2-Sheet",
    line: {
      color: sheetColor,
      width: 2
    }
  };
  data = [cbtLine, sheetLine, helixLine];
  layout = {
    title: plotTitle,
    titlefont: {
      family: "Montserrat",
      size: 24,
      color: "#7a7a7a"
    },
    xaxis: {
      title: "X-Axis Title",
      titlefont: {
        family: 'Montserrat',
        size: 18,
        color: '#7a7a7a',
      },
      ticklen: 8,
      tickwidth: 1,
      /* Set the step in-between ticks*/
      dtick: null,
      // /* Set the values at which ticks on this axis appear */
      tickvals: null,
      // /* Set the text displayed at the ticks position via tickvals */
      ticktext: null,
      tickfont: {
        size: 14,
        color: "#7a7a7a"
      },
      ticks: 'outside',
      showgrid: false,
      showline: true
    },
    yaxis: {
      title: "Secondary Structure %",
      titlefont: {
        family: 'Montserrat',
        size: 18,
        color: '#7a7a7a'
      },
      ticklen: 0,
      tickwidth: 1,
      /* Set the step in-between ticks*/
      dtick: null,
      // /* Set the values at which ticks on this axis appear */
      tickvals: null,
      // /* Set the text displayed at the ticks position via tickvals */
      ticktext: null,
      tickfont: {
        size: 14,
        color: "#7a7a7a"
      },
      ticks: 'outside',
      showgrid: false,
      showline: true,
      range: [0, 100]
    }
  };
  if (graphType == "line-time") {
    layout.xaxis.title = "Time (ns)";
  } else if (graphType == "line-res") {
    layout.xaxis.title = "Residue Number";
  }
  plot = Plotly.newPlot('plot', data, layout, {
    showSendToCloud: true
  });
  plotArea.style.width = "100%";
  document.getElementById("line-width-input").value = 2;
  let widthLabel = document.getElementById("line-width-label");
  widthLabel.innerHTML = "2px";
}

//========== RESIDUE PLOT METHODS ==========
function makeResidueAxes(averageStrands) {
  if (averageStrands) {
    yAxes = [
      [],
      [],
      []
    ];
  }
  for (var resNum = 0; resNum < xpmAxes[0].length; resNum++) {
    let structureVotes = [];
    for (var time = 0; time < xpmAxes[0][0].length; time++) {
      for (var fileNum = 0; fileNum < xpmAxes.length; fileNum++) {
        structureVotes.push(xpmAxes[fileNum][resNum][time]);
      }
    }
    if (averageStrands) {
      let cbt = 0;
      let helix = 0;
      let sheet = 0;
      let totalVotes = 0;
      for (var votei = 0; votei < structureVotes.length; votei++) {
        if (structureVotes[votei] == "cbt") {
          cbt += 1;
          totalVotes += 1;
        } else if (structureVotes[votei] == "helix") {
          helix += 1;
          totalVotes += 1;
        } else if (structureVotes[votei] == "sheet") {
          sheet += 1;
          totalVotes += 1;
        }
      }
      yAxes[0].push(cbt / totalVotes * 100);
      yAxes[1].push(helix / totalVotes * 100);
      yAxes[2].push(sheet / totalVotes * 100);
    }
  }
  let avgYsAxes = [
    [],
    [],
    []
  ];
  let avgYsIndex = 0;
  let chainSepCount = 0;
  for (var yIndex = 0; yIndex < yAxes[0].length; yIndex++) {
    if (isNaN(yAxes[0][yIndex])) {
      chainSepCount += 1;
      avgYsIndex = 0;
    } else {
      if (chainSepCount == 0) {
        avgYsAxes[0].push(0);
        avgYsAxes[1].push(0);
        avgYsAxes[2].push(0);
      }
      avgYsAxes[0][avgYsIndex] += yAxes[0][yIndex];
      avgYsAxes[1][avgYsIndex] += yAxes[1][yIndex];
      avgYsAxes[2][avgYsIndex] += yAxes[2][yIndex];
      // console.log("avgYsIndex: " + avgYsIndex);
      // console.log("avgYsAxes[0][avgYsIndex]:");
      // console.log(avgYsAxes[0][avgYsIndex]);
      // console.log("yIndex: " + yIndex);
      // console.log("yAxes[0][yIndex]: ");
      // console.log(yAxes[0][yIndex]);
      // console.log("\n");
      avgYsIndex += 1;
    }
  }
  for (var i = 0; i < avgYsAxes[0].length; i++) {
    avgYsAxes[0][i] = avgYsAxes[0][i] / (chainSepCount + 1);
    avgYsAxes[1][i] = avgYsAxes[1][i] / (chainSepCount + 1);
    avgYsAxes[2][i] = avgYsAxes[2][i] / (chainSepCount + 1);
  }
  // Populate xAxis here so you don't count multiple strands
  let xAxis = [];
  for (var x = 1; x <= avgYsAxes[0].length; x++) {
    xAxis.push(x);
  }
  // console.log("avgYsAxes and yAxes:");
  // console.log(avgYsAxes);
  // console.log(yAxes);
  // console.log(xAxis);
  yAxes = avgYsAxes;
  checkAxes(xAxis, yAxes);
  return ([xAxis, yAxes]);
}

//==========TIME PLOT METHODS===========
function makeTimeAxes(averageStrands) {
  let xAxis = [];
  if (averageStrands) {
    yAxes = [
      [],
      [],
      []
    ];
  }
  for (var time = 0; time < xpmAxes[0][0].length; time++) {
    let structureVotes = [];
    for (var resNum = 0; resNum < xpmAxes[0].length; resNum++) {
      for (var fileNum = 0; fileNum < xpmAxes.length; fileNum++) {
        structureVotes.push(xpmAxes[fileNum][resNum][time]);
      }
    }
    if (averageStrands) {
      let cbt = 0;
      let helix = 0;
      let sheet = 0;
      let totalVotes = 0;
      for (var votei = 0; votei < structureVotes.length; votei++) {
        if (structureVotes[votei] == "cbt") {
          cbt += 1;
          totalVotes += 1;
        } else if (structureVotes[votei] == "helix") {
          helix += 1;
          totalVotes += 1;
        } else if (structureVotes[votei] == "sheet") {
          sheet += 1;
          totalVotes += 1;
        }
      }
      yAxes[0].push(cbt / totalVotes * 100);
      yAxes[1].push(helix / totalVotes * 100);
      yAxes[2].push(sheet / totalVotes * 100);
    }
    xAxis.push(time / 100);
  }
  checkAxes(xAxis, yAxes);
  return [xAxis, yAxes];
}

function checkAxes(xAxis, yAxes) {
  let check = true;
  for (var s = 0; s < yAxes.length; s++) {
    for (var x = 0; x < xAxis.length; x++) {
      if (yAxes[s][x] > 100 || yAxes[s][x] < 0) {
        pass = false;
      }
    }
  }
  if (!check) {
    console.log("\nDid not pass axes check...\n");
  }
}

//========== Plot Controls ==========
function updatePlot(targetID, newValue) {
  let plotDiv = document.getElementById("plot");
  let targetElem = document.getElementById(targetID);
  switch (targetID) {
    case "plot-title-input":
      layout.title.text = targetElem.value;
      break;

    case "title-font-choice":
      layout.title.font.family = newValue;
      let titleFontFamLabel = document.getElementsByClassName("title-font-family-input")[0];
      titleFontFamLabel.innerHTML = newValue + '   <i class="dropdown-arrow fas fa-caret-down"></i>';
      break;

    case "title-font-size-input":
      layout.title.font.size = targetElem.value;
      break;

    case "title-color":
      layout.title.font.color = targetElem.value;
      break;

    case "gen-coil-color":
      data[0].line.color = targetElem.value;
      break;

    case "gen-helix-color":
      data[1].line.color = targetElem.value;
      break;

    case "gen-sheet-color":
      data[2].line.color = targetElem.value;
      break;

    case "line-width-input":
      let w = targetElem.value;
      let widthLabel = document.getElementById("line-width-label");
      widthLabel.innerHTML = w + "px";
      if (data == null) {
        return;
      }
      data[0].line.width = w;
      data[1].line.width = w;
      data[2].line.width = w;
      break;

    case "xaxis-title-input":
      layout.xaxis.title.text = targetElem.value;
      break;

    case "xaxis-title-font-choice":
      layout.xaxis.title.font.family = newValue;
      let xaxisTitleFontFamLabel = document.getElementsByClassName("title-font-family-input")[1];
      xaxisTitleFontFamLabel.innerHTML = newValue + '   <i class="dropdown-arrow fas fa-caret-down"></i>';
      break;

    case "xaxis-title-font-size-input":
      layout.xaxis.title.font.size = targetElem.value;
      break;

    case "xaxis-title-color":
      layout.xaxis.title.font.color = targetElem.value;
      layout.xaxis.tickfont.color = targetElem.value;
      layout.xaxis.tickcolor = targetElem.value;
      layout.xaxis.linecolor = targetElem.value;
      break;

    case "xaxis-ticks-outside":
      if (newValue.checked) {
        layout.xaxis.ticks = "outside";
      }
      break;

    case "xaxis-ticks-inside":
      if (newValue.checked) {
        layout.xaxis.ticks = "inside";
      }
      break;

    case "xaxis-tick-length-input":
      layout.xaxis.ticklen = targetElem.value;
      break;

    case "xaxis-tick-width-input":
      layout.xaxis.tickwidth = targetElem.value;
      break;

    case "xaxis-tick-distance-input":
      layout.xaxis.dtick = targetElem.value;
      break;

    case "xaxis-tick-font-size-input":
      layout.xaxis.tickfont.size = targetElem.value;
      break;

    case "yaxis-title-input":
      layout.yaxis.title.text = targetElem.value;
      break;

    case "yaxis-title-font-choice":
      layout.yaxis.title.font.family = newValue;
      let yaxisTitleFontFamLabel = document.getElementsByClassName("title-font-family-input")[2];
      yaxisTitleFontFamLabel.innerHTML = newValue + '   <i class="dropdown-arrow fas fa-caret-down"></i>';
      break;

    case "yaxis-title-font-size-input":
      layout.yaxis.title.font.size = targetElem.value;
      break;

    case "yaxis-title-color":
      layout.yaxis.title.font.color = targetElem.value;
      layout.yaxis.tickfont.color = targetElem.value;
      layout.yaxis.tickcolor = targetElem.value;
      layout.yaxis.linecolor = targetElem.value;
      break;

    case "yaxis-ticks-outside":
      if (newValue.checked) {
        layout.yaxis.ticks = "outside";
      }
      break;

    case "yaxis-ticks-inside":
      if (newValue.checked) {
        layout.yaxis.ticks = "inside";
      }
      break;

    case "yaxis-tick-length-input":
      layout.yaxis.ticklen = targetElem.value;
      break;

    case "yaxis-tick-width-input":
      layout.yaxis.tickwidth = targetElem.value;
      break;

    case "yaxis-tick-distance-input":
      layout.yaxis.dtick = targetElem.value;
      break;

    case "yaxis-tick-font-size-input":
      layout.yaxis.tickfont.size = targetElem.value;
      break;

    default:

  }
  Plotly.react(plotDiv, data, layout);
}
