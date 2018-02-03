"use strict";

var convert = require("xml-js");

function getPlainText(elms) {
  var res = "";
  for (var i = 0; i != elms.length; ++i) {
    var elm = elms[i];
    if (elm.type != "text") continue;
    res += elm.text;
  }
  return res;
}

function tunit(jobj) {
  this.jobj = jobj;

  return {
    status: function() {
      return jobj.attributes["mq:status"];
    },
    matchRate: function() {
      if (jobj.attributes["mq:percent"]) return jobj.attributes["mq:percent"] * 1;
      else return 0;
    },
    srcPlain: function() {
      for (var i = 0; i != jobj.elements.length; ++i) {
        if (jobj.elements[i].name == "source") {
          return getPlainText(jobj.elements[i].elements);
        }
      }
    },
    trgPlain: function(txt) {
      var segElm;
      for (var i = 0; i != jobj.elements.length; ++i) {
        if (jobj.elements[i].name == "target") {
          segElm = jobj.elements[i];
          break;
        }
      }
      if (txt === undefined) {
        for (var i = 0; i != jobj.elements.length; ++i) {
          return getPlainText(segElm.elements);
        }
      }
      else if (typeof txt === 'string' || txt instanceof String) {
        segElm.elements = [{ type: "text", text: txt }];
      }
    }
  };
}

function tdoc(jobj) {
  this.jobj = jobj;

  var eFile = jobj.elements[0].elements[0];
  var tuArr;
  for (var i = 0; i != eFile.elements.length; ++i) {
    if (eFile.elements[i].name == "body") {
      tuArr = eFile.elements[i].elements;
    }
  }
  this.tuArr = tuArr;

  return {
    info: function() {
      var eFile = jobj.elements[0].elements[0];
      return {
        srcLang: eFile.attributes["source-language"],
        trgLang: eFile.attributes["target-language"],
        docName: eFile.attributes["original"],
        tuCount: tuArr.length
      };
    },
    getTU: function(ix) {
      return new tunit(tuArr[ix]);
    },
    writeXliff: function() {
     return convert.js2xml(jobj, {
        compact: false
      });
    },
    writeJson: function() {
      return JSON.stringify(jobj, null, 2);
    }
  };
}

module.exports = function (xliffstr) {
  var jobj = convert.xml2js(xliffstr, {
    compact: false,
    alwaysChildren: true,
    ignoreComment: true
  });
  return new tdoc(jobj);
};