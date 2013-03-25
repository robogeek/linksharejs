
var url      = require('url');
var util     = require('util');
var request  = require('request');
var libxmljs = require("libxmljs");


var token = undefined;

exports.setup = function(_token) {
    token = _token;
}

var findChild = function(elem, tagname) {
    for (var i = 0, child = elem.child(i); child; i++, child = elem.child(i)) {
        if (child.name() === tagname) return child;
    }
    return undefined;
}

/**
 * Queries for products.
 **/
exports.query = function(params, done) {
    
    if (typeof token === "undefined") {
        done("NO TOKEN");
        return;
    }
    
    var qryobj = {
        token: token,
        keyword: params.keyword
    };
    
    qryobj.sort       = "price"; // default
    qryobj.sorttype   = "asc";   // default
    qryobj.MaxResults = "100";   // default
    qryobj.pagenumber = "1";     // default
    if (params.category)   qryobj.cat        = params.category;
    if (params.sorttype)   qryobj.sorttype   = params.sorttype;
    if (params.sort)       qryobj.sort       = params.sort;
    if (params.MaxResults) qryobj.MaxResults = params.MaxResults;
    if (params.pagenumber) qryobj.pagenumber = params.pagenumber;
    if (params.mid)        qryobj.mid        = params.mid;
    
    var requrl = url.format({
        protocol: "http",
        host: "productsearch.linksynergy.com",
        pathname: "/productsearch",
        query: qryobj
    });
    // util.log("REQUEST URL: " + requrl);
    
    request({
        method: 'GET',
        uri: requrl
    }, function(error, response, body) {
        if (error) { done(error); return; }
        // util.log('RESULT ' + body);
        var xmlDoc = libxmljs.parseXmlString(body);
        var doc = xmlDoc.root();
        // util.log(util.inspect(doc));
        // util.log('TotalMatches ' + util.inspect(doc.get('//TotalMatches')));
        // util.log('TotalPages ' + util.inspect(doc.get('//TotalPages')));
        // util.log('PageNumber ' + util.inspect(doc.get('//PageNumber')));
        var children = xmlDoc.root().childNodes();
        var res = {
            matches: findChild(doc, 'TotalMatches') ? findChild(doc, 'TotalMatches').text() : 0,
            pages: findChild(doc, 'TotalPages') ? findChild(doc, 'TotalPages').text() : 0,
            pagenum: findChild(doc, 'PageNumber') ? findChild(doc, 'PageNumber').text() : -1,
            items: []
        }
        // util.log(util.inspect(res));
        for (var i = 0, child = doc.child(i); child; i++, child = doc.child(i)) {
            if (child.name() !== "item") continue; // only looking for item's
            // util.log(findChild(child, 'productname') ? findChild(child, 'productname').text() : "NF");
            // util.log(findChild(child, 'description') ? findChild(child, 'description').text() : "NF");
            // util.log(child.text());
            var mid = findChild(child, 'mid');
            var merchantname = findChild(child, 'merchantname');
            var linkid = findChild(child, 'linkid');
            var createdon = findChild(child, 'createdon');
            var sku = findChild(child, 'sku');
            var productname = findChild(child, 'productname');
            var category = findChild(child, 'category');
            var price = findChild(child, 'price');
            var upccode = findChild(child, 'upccode');
            var description = findChild(child, 'description');
            var keywords = findChild(child, 'keywords');
            var linkurl = findChild(child, 'linkurl');
            var imageurl = findChild(child, 'imageurl');
            res.items.push({
                merchantid: mid ? mid.text() : "",
                merchant: merchantname ? merchantname.text() : "",
                linkid: linkid ? linkid.text() : "",
                createdon: createdon ? createdon.text() : "",
                sku: sku ? sku.text() : "",
                productname: productname ? productname.text() : "",
                categoryprimary: category ? findChild(category, 'primary').text() : "",
                categorysecondary: category ? findChild(category, 'secondary').text() : "",
                price: price ? price.text() : "",
                currency: price ? price.attr('currency').value() : "",
                upccode: upccode ? upccode.text() : "",
                descriptionshort: description ? findChild(description, 'short').text() : "",
                descriptionlong: description ? findChild(description, 'long').text() : "",
                keywords: keywords ? keywords.text() : "",
                linkurl: linkurl ? linkurl.text() : "",
                imageurl: imageurl ? imageurl.text() : ""
            });
        }
        done(null, res);
    });
};

/**
 * Generates targeted advertisements from Linkshare's product lines based on the content of
 * a page on your website.  TODO UNTESTED
 **/
module.exports.targeted = function(params, done) {
    
    if (typeof token === "undefined") {
        done("NO TOKEN");
        return;
    }
    
    var qryobj = {
        token: token,
        height: params.height,
        width: params.width
    };
    if (params.mid)   qryobj.mid   = params.mid;
    if (params.count) qryobj.count = params.count;
    if (params.url)   qryobj.url   = params.url;
    
    var requrl = url.format({
        protocol: "http",
        host: "contextualproducts.linksynergy.com",
        pathname: "/target",
        query: qryobj
    });
    request({
        method: 'GET',
        uri: requrl
    }, function(error, response, body) {
        if (error) { done(error); return; }
        // util.log('RESULT ' + body);
        var xmlDoc = libxmljs.parseXmlString(body);
        var doc = xmlDoc.root();
        var children = xmlDoc.root().childNodes();
        var res = {
            matches: doc.get('//TotalMatches').text(),
            items: []
        }
        children.forEach(function(child) {
            // util.log(inspectElement(child));
            res.items.push({
                merchantid: child.get('//mid').text(),
                merchant: child.get('//merchantname').text(),
                sku: child.get('//sku').text(),
                productname: child.get('//productname').text(),
                categoryprimary: child.get('//category/primary').text(),
                categorysecondary: child.get('//category/secondary').text(),
                descriptionshort: child.get('//description/short').text(),
                descriptionlong: child.get('//description/long').text(),
                price: child.get('//price').text(),
                currency: child.get('//price').attr('currency').value(),
                upccode: child.get('//upccode').text(),
                keywords: child.get('//keywords').text(),
                clickurl: child.get('//clickurl').text(),
                adurl: child.get('//adurl').text(),
                impressionurl: child.get('//impressionurl').text(),
            });
        });
        done(null, res);
    });
}

/**
 * Generates a link to a merchant page.  TODO UNTESTED
 **/
module.exports.deeplink = function(params, done) {
    if (typeof token === "undefined") {
        done("NO TOKEN");
        return;
    }
    
    // http://getdeeplink.linksynergy.com/createcustomlink.shtml?token=<token-ID>&mid=<MID>&murl=<URL-from-merchant>
    
    var requrl = url.format({
        protocol: "http",
        host: "etdeeplink.linksynergy.com",
        pathname: "/createcustomlink.shtml",
        query: {
            token: token,
            mid: params.mid,
            murl: params.murl
        }
    });
    util.log("REQUEST URL: " + requrl);
    request({
        method: 'GET',
        uri: requrl
    }, function(error, response, body) {
        if (error) { done(error); return; }
        util.log(body);
        done(null, body);
    });
}