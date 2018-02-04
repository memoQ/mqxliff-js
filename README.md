# mqxliff-js
A minimalistic MQXLIFF parser and serializer. Functions:
* Parse a memoQ bilingual document into memory
* Access basic document information: source and taget language; original name; number of translation units
* Access translation units: source and target; match rate; segment status
* Replace specific target segments with plain text, or fully formatted segment data
* Serialize the document back into MQXLIFF

This is a plain vanilla Javascript module, with a .d.ts file for added clarity. The type annotations are particularly useful
to grasp the rich segment representation. Do check out the docs (generated by typedoc from comments in the .d.ts file).

## Simple example from Node

```js
"use strict";

var mqxliff = require("mqxliff");
var fs = require('fs');

var fnbase = "sample";

fs.readFile(__dirname + "/data/" + fnbase + ".mqxliff", function (err, data) {
  var tdoc = mqxliff(data);
  var info = tdoc.info();
  for (var i = 0; i != info.tuCount; ++i) {
    var tu = tdoc.getTU(i);
    var txtStatus = tu.matchRate() + "% " + tu.status();
    var srcPlain = tu.srcPlain();
    var trgPlain = tu.trgPlain();
    var srcRichPrinted = richToStr(tu.srcRich());
    var trgRichPrinted = richToStr(tu.trgRich());
    console.log(txtStatus);
    console.log(srcPlain);
    console.log(srcRichPrinted);
    console.log(trgPlain);
    console.log(trgRichPrinted);
  }
  tdoc.getTU(2).trgPlain("Hey yo, brouhaha!");
  var json = tdoc.writeJson();

  fs.writeFile(__dirname + "/data/" + fnbase + "-out.json", json, function (err) {
    console.log("JSON saved.");
    var xml = tdoc.writeXliff();
    fs.writeFile(__dirname + "/data/" + fnbase + "-out.mqxliff", xml, function (err) {
      console.log("XML saved.");
    });
  });
});

function printFmtChange(prev, curr) {
  var res = "";
  if (!prev.bold && curr.bold) res += "[b]";
  if (prev.bold && !curr.bold) res += "[/b]";
  if (!prev.italic && curr.italic) res += "[i]";
  if (prev.italic && !curr.italic) res += "[/i]";
  if (!prev.underlined && curr.underlined) res += "[u]";
  if (prev.underlined && !curr.underlined) res += "[/u]";
  if (!prev.subscript && curr.subscript) res += "[sub]";
  if (prev.subscript && !curr.subscript) res += "[/sub]";
  if (!prev.superscript && curr.superscript) res += "[sup]";
  if (prev.superscript && !curr.superscript) res += "[/sup]";
  return res;
}

function printTag(cont) {
  var res = "[";
  if (cont.type == "CloseTag") res += "/";
  res += cont.name;
  for (var i = 0; i < cont.attrs.length; ++i) {
    res += " ";
    res += cont.attrs[i].attr;
    res += "='";
    res += cont.attrs[i].val;
    res += "'";
  }
  if (cont.type == "EmptyTag") res += "/";
  res += "]";
  return res;
}

function richToStr(ranges) {
  var res = "";
  var allOff = { bold: false, italic: false, underlined: false, subscript: false, superscript: false };
  var prev = allOff;
  for (var i = 0; i < ranges.length; ++i) {
    var range = ranges[i];
    res += printFmtChange(prev, range);
    for (var j = 0; j != range.content.length; ++j) {
      var cont = range.content[j];
      if (cont.type == "Text") res += cont.text;
      else if (cont.type == "StructuralTag") res += "{}";
      else res += printTag(cont);
    }
    prev = range;
  }
  res += printFmtChange(prev, allOff);
  return res;
}

```
