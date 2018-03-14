import { js2xml, xml2js } from "xml-js";
import { FormatRange, ContentRun, AttrVal, RunType, Document, TU } from './interfaces';



function makeRange(proto?): FormatRange {
    var range = {
        bold: proto === undefined ? false : proto.bold,
        italic: proto === undefined ? false : proto.italic,
        underlined: proto === undefined ? false : proto.underlined,
        subscript: proto === undefined ? false : proto.subscript,
        superscript: proto === undefined ? false : proto.superscript,
        content: []
    };
    return range;
}

function parseTag(str: string): ContentRun {
    if (str.startsWith("</")) str = "<" + str.substring(2);
    if (str.endsWith("/>")) str = str.substring(0, str.length - 2) + ">";
    var obj = xml2js(str);
    var res = {
        name: obj.elements[0].name,
        attrs: new Array<AttrVal>()
    };
    var objAttrs = obj.elements[0].attributes;
    for (var prop in objAttrs) {
        if (objAttrs.hasOwnProperty(prop)) {
            res.attrs.push({ attr: prop, val: objAttrs[prop] });
        }
    }
    return res;
}

function getRichText(elms): FormatRange[] {
    console.log("elms");
    console.log(elms);
    var res = new Array<FormatRange>();
    var range = makeRange();
    var idToFormat = {};
    for (var i = 0; i != elms.length; ++i) {
        var elm = elms[i];
        // Text
        if (elm.type == "text") {
            range.content.push({
                type: RunType.Text,
                text: elm.text
            });
        }
        else {
            // Start formatting
            if (elm.name == "bpt" && elm.attributes.ctype) {
                res.push(range);
                range = makeRange(range);
                if (elm.attributes.ctype == "bold") { range.bold = true; idToFormat[elm.attributes.id] = "bold"; }
                else if (elm.attributes.ctype == "italic") { range.italic = true; idToFormat[elm.attributes.id] = "italic"; }
                else if (elm.attributes.ctype == "underlined") { range.underlined = true; idToFormat[elm.attributes.id] = "underlined"; }
                else if (elm.attributes.ctype == "x-sub") { range.subscript = true; idToFormat[elm.attributes.id] = "subscript"; }
                else if (elm.attributes.ctype == "x-sup") { range.superscript = true; idToFormat[elm.attributes.id] = "superscript"; }
            }
            // Open inline tag
            else if (elm.name == "bpt") {
                var tag = parseTag(elm.elements[0].text);
                tag.type = RunType.OpenTag;
                range.content.push(tag);
            }
            // End formatting, or close inline tag
            else if (elm.name == "ept") {
                // End formatting
                if (elm.elements[0].text == "{}") {
                    res.push(range);
                    range = makeRange(range);
                    var fmt = idToFormat[elm.attributes.id];
                    if (fmt == "bold") range.bold = false;
                    else if (fmt == "italic") range.italic = false;
                    else if (fmt == "underlined") range.underlined = false;
                    else if (fmt == "subscript") range.subscript = false;
                    else if (fmt == "superscript") range.superscript = false;
                }
                // Close inline tag
                else {
                    var tag = parseTag(elm.elements[0].text);
                    tag.type = RunType.CloseTag;
                    range.content.push(tag);
                }
            }
            // Empty inline tag
            else if (elm.name == "ph") {
                var tag = parseTag(elm.elements[0].text);
                tag.type = RunType.EmptyTag;
                range.content.push(tag);
            }
            // Structural tag
            else if (elm.name == "x") {
                range.content.push({ type: RunType.StructuralTag });
            }
        }
    }
    // We might have a trailing range
    if (range.content.length > 0) res.push(range);
    return res;
}

function makeElement(name: string, type: string, attr: any) {
    var element = {
        attributes: attr === undefined ? false : attr,
        name: name === undefined ? false : name,
        type: type === undefined ? false : type,
        elements: new Array({
            text: "{}",
            type: "text"
        }) 
    };
    return element;
}

function setRichText(formatRange: FormatRange[]): any {
    console.log("setRichText");
    var elms = new Array();

    var bold = false;
    var boldId = 0;
    var italic = false;
    var italicId = 0;
    var subscript = false;
    var subscriptId = 0;
    var superscript = false;
    var superscriptId = 0;
    var underlined = false;
    var underlinedId = 0;
    var id = 1;
    for (var i = 0; i < formatRange.length; i++ ) {
        //var attributes = new Array();
        if (formatRange[i].bold && bold == false) {
            bold = true;
            var attr = {
                ctype: "bold",
                id: id.toString()
            }
            boldId=id;
            /*elements.name = "bpt";
            elements.type = "element";
            elements.attributes.push(attr);*/
            elms.push(makeElement("bpt", "element", attr));
            id++;
        }
        if (formatRange[i].italic) {
            italic = true;
            var attr = {
                ctype: "italic",
                id: id.toString()
            }
            italicId = id;
            elms.push(makeElement("bpt", "element", attr));
            id++;
        }
        if (formatRange[i].subscript) {
            subscript = true;
            var attr = {
                ctype: "x-sub",
                id: id.toString()
            }
            subscriptId = id;
            elms.push(makeElement("bpt", "element", attr));
            id++;
        }
        if (formatRange[i].superscript) {
            superscript = true;
            var attr = {
                ctype: "x-sup",
                id: id.toString()
            }
            superscriptId = id;
            elms.push(makeElement("bpt", "element", attr));
            id++;
        }
        if (formatRange[i].underlined) {
            underlined = true;
            var attr = {
                ctype: "underlined",
                id: id.toString()
            }
            underlinedId = id;
            elms.push(makeElement("bpt", "element", attr));
            id++;
        }

        if (formatRange[i].bold === false && bold === true) {
            console.log("add bold!!!! " +boldId );
            bold = false;
            var attrclose = {
                id: boldId.toString()
            }
            elms.push(makeElement("ept", "element", attrclose));
        }
        if (formatRange[i].italic === false && italic === true) {
            italic = false;
            var attrclose = {
                id: italicId.toString()
            }
            elms.push(makeElement("ept", "element", attrclose));
        }
        if (formatRange[i].subscript === false && subscript === true) {
            subscript = false;
            var attrclose = {
                id: subscriptId.toString()
            }
            elms.push(makeElement("ept", "element", attrclose));
        }
        if (formatRange[i].superscript === false && superscript === true) {
            superscript = false;
            var attrclose = {
                id: superscriptId.toString()
            }
            elms.push(makeElement("ept", "element", attrclose));
        }
        if (formatRange[i].underlined === false && underlined === true) {
            underlined = false;
            var attrclose = {
                id: underlinedId.toString()
            }
            elms.push(makeElement("ept", "element", attrclose));
        }
        for (var cv = 0; formatRange[i].content.length > cv; cv++) {
            /*if(formatRange[i].content[cv].type === RunType.Text) {
                formatRange[i].content[cv].type = RunType.Text;
            }*/
            elms.push(formatRange[i].content[cv]);
        }
    }
    return elms;
}

function getPlainText(elms): String {
    var res = "";
    for (var i = 0; i != elms.length; ++i) {
        var elm = elms[i];
        if (elm.type != "text") continue;
        res += elm.text;
    }
    return res;
}

function tunit(jobj: any): TU {
    //this.jobj = jobj;

    return {
        status: function () {
            return jobj.attributes["mq:status"];
        },
        matchRate: function () {
            if (jobj.attributes["mq:percent"]) return jobj.attributes["mq:percent"] * 1;
            else return 0;
        },
        srcPlain: function (txt?: String) {
            var segElm;
            for (var i = 0; i != jobj.elements.length; ++i) {
                if (jobj.elements[i].name == "source") {
                    segElm = jobj.elements[i];
                    break;
                }
            }
            if (txt === undefined) {
                for (var i = 0; i != jobj.elements.length; ++i) {
                    return getPlainText(segElm.elements);
                }
            } else if (typeof txt === 'string') {
                segElm.elements = [{ type: "text", text: txt }];
            }
        },
        trgPlain: function (txt?: String) {
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
            else if (typeof txt === 'string') {
                segElm.elements = [{ type: "text", text: txt }];
            }
        },
        srcRich: function (seg?: FormatRange[]) {
            if (seg === undefined) {
                for (var i = 0; i != jobj.elements.length; ++i) {
                    if (jobj.elements[i].name == "source") {
                        return getRichText(jobj.elements[i].elements);
                    }
                }
            } else {
                for (var i = 0; i != jobj.elements.length; ++i) {
                    if (jobj.elements[i].name == "source") {
                        console.log("before changes");
                        console.log(jobj.elements[i].elements);
                        jobj.elements[i].elements = setRichText(seg);
                        console.log("after changes");
                        console.log(jobj.elements[i].elements);
                    }
                }
            }
        },
        trgRich: function (seg?: FormatRange[]) {
            if (seg === undefined) {
                for (var i = 0; i != jobj.elements.length; ++i) {
                    if (jobj.elements[i].name == "target") {
                        return getRichText(jobj.elements[i].elements);
                    }
                }
            }
            else {
                for (var i = 0; i != jobj.elements.length; ++i) {
                    if (jobj.elements[i].name == "target") {
                        console.log(jobj.elements[i].elements)
                        jobj.elements[i].elements = setRichText(seg);
                    }
                }
            }
        }
    };
}

function tdoc(jobj: any): Document {
    //var jobj = jobj;

    var eFile = jobj.elements[0].elements[0];
    var tuArr;
    for (var i = 0; i != eFile.elements.length; ++i) {
        if (eFile.elements[i].name == "body") {
            tuArr = eFile.elements[i].elements;
        }
    }
    //this.tuArr = tuArr;

    return {
        info: function () {
            var eFile = jobj.elements[0].elements[0];
            return {
                srcLang: eFile.attributes["source-language"],
                trgLang: eFile.attributes["target-language"],
                docName: eFile.attributes["original"],
                tuCount: tuArr.length
            };
        },
        getTU: function (ix) {
            return tunit(tuArr[ix]);
        },
        writeXliff: function () {
            return js2xml(jobj, {
                compact: false
            });
        },
        writeJson: function () {
            return JSON.stringify(jobj, null, 2);
        }
    };
}








/**
 * Parses a memoQ bilingual XLIFF file.
 * @param xliffstr The MQXLIFF (an XML file) as string.
 * @returns A fully loaded in-memory translation [[Document]].
 */
function mqxliff(xliffstr: string): Document {
    var jobj = xml2js(xliffstr, {
        compact: false,
        alwaysChildren: true,
        ignoreComment: true
    });
    return tdoc(jobj);
}

export default mqxliff;