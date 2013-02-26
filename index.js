
var url      = require('url');
var util     = require('util');
var request  = require('request');
var libxmljs = require("libxmljs");

var apidmn  = "feed.linksynergy.com";

var token = undefined;

exports.setup = function(_token) {
    token = _token;
}

exports.query = function(params, done) {
    
    if (typeof token === "undefined") {
        done("NO TOKEN");
        return;
    }
    
    var qryobj = {
        token: token,
        keyword: params.keyword,
        sort: params.sort,
        sorttype: params.sorttype
    };
    
    var requrl = url.format({
        protocol: "http",
        host: apidmn,
        pathname: "/productsearch",
        query: qryobj
    });
    util.log("REQUEST URL: " + requrl);
    
    request({
        method: 'GET',
        uri: requrl
    }, function(error, response, body) {
        if (error) throw error;
        util.log('RESULT ' + body);
        var xmlDoc = libxmljs.parseXmlString(body);
        var doc = xmlDoc.root();
        var children = xmlDoc.root().childNodes();
        var res = {
            matches: doc.get('//TotalMatches').text(),
            pages: doc.get('//TotalPages').text(),
            pagenum: doc.get('//PageNumber').text(),
            items: []
        }
        children.forEach(function(child) {
            // util.log(inspectElement(child));
            res.items.push({
                merchantid: child.get('//mid').text(),
                merchant: child.get('//merchantname').text(),
                linkid: child.get('//linkid').text(),
                createdon: child.get('//createdon').text(),
                sku: child.get('//sku').text(),
                productname: child.get('//productname').text(),
                categoryprimary: child.get('//category/primary').text(),
                categorysecondary: child.get('//category/secondary').text(),
                price: child.get('//price').text(),
                currency: child.get('//price').attr('currency').value(),
                upccode: child.get('//upccode').text(),
                descriptionshort: child.get('//description/short').text(),
                descriptionlong: child.get('//description/long').text(),
                keywords: child.get('//keywords').text(),
                linkurl: child.get('//linkurl').text(),
                imageurl: child.get('//imageurl').text()
            });
        });
        done(null, res);
    });
};

