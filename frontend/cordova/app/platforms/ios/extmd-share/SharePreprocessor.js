var SharePreprocessor = function() {};

SharePreprocessor.prototype = {
run: function(arguments) {
    arguments.completionFunction({"url": document.URL, "title": document.title});
}
};

var ExtensionPreprocessingJS = new SharePreprocessor;