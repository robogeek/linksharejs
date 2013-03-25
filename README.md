
Linkshare Merchandiser Query API Implementation
===============================================

```
var linksharejs = require('linksharejs');
linksharejs.setup(... your API token);

linksharejs.query({
    keyword: "thing to search for",
    category: "category",
    mid: #####
}, function(err, data) {
    Process data
});
```