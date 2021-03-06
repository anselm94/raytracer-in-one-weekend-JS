var Image = require("./model/image");
var FileManager = require("./utils/filemanager");
var Vector = require("./model/vector");
var Ray = require("./model/ray");
var HitRecord = require("./model/hitable").HitRecord;
var HitableList = require("./model/hitablelist");
var Sphere = require("./model/shape/sphere");
var Camera = require("./model/camera-variablefov");
var Lambertian = require('./model/material/lambertian');

console.log("--------------------------------");
console.log("Exercise 11: Positionable Camera");
console.log("--------------------------------");

var iResX = 200,
    iResY = 100,
    iSamples = 100;
var mImage = new Image(iResX, iResY);

var iR = Math.cos(Math.PI / 4);
var listHitable = [];
listHitable.push(new Sphere(new Vector(-iR, 0, -1), iR, new Lambertian(new Vector(0, 0, 1))));
listHitable.push(new Sphere(new Vector(iR, 0, -1), iR, new Lambertian(new Vector(1, 0, 0))));
var hitableWorld = new HitableList(listHitable);
var camera = new Camera(90, iResX / iResY);

for (var j = iResY - 1; j >= 0; j--) {
    for (var i = 0; i < iResX; i++) {
        var color = new Vector(0, 0, 0);
        for (var sample = 0; sample < iSamples; sample++) {
            var u = (i + Math.random()) / iResX;
            var v = (j + Math.random()) / iResY;
            ray = camera.getRay(u, v);
            var vectorPoint = ray.pointAt(2);
            color.addTo(generateColor(ray, hitableWorld, 0));
        }
        color = color._divide(iSamples);
        color = new Vector(Math.sqrt(color.x), Math.sqrt(color.y), Math.sqrt(color.z));
        mImage.pushRawPixel(color.x, color.y, color.z);
    }
}

function generateColor(rayIn, hitableWorld, iDepth) {
    var hitrecord = new HitRecord();
    var iTmax = Math.pow(10, 38);
    if (hitableWorld.hit(rayIn, 0.001, iTmax, hitrecord)) {
        var rayScattered = new Ray(new Vector(0, 0, 0), new Vector(0, 0, 0));
        var vectorAttenuation = new Vector(0, 0, 0);
        if (iDepth < 50 && hitrecord.material.scatter(rayIn, hitrecord, vectorAttenuation, rayScattered)) {
            var color = generateColor(rayScattered, hitableWorld, iDepth + 1);
            return new Vector(vectorAttenuation.x * color.x, vectorAttenuation.y * color.y, vectorAttenuation.z * color.z);
        } else {
            return new Vector(0, 0, 0);
        }
    } else {
        var t = (rayIn.direction.getUnit().y + 1) * 0.5;
        var colorStart = new Vector(1, 1, 1);
        var colorEnd = new Vector(0.5, 0.7, 1.0);
        return colorStart.multiply(1 - t).add(colorEnd.multiply(t)); // (1 - posY) * colorStart + posY * colorEnd
    }
}

var sFileName = __filename.slice(__dirname.length + 1, -3);
FileManager.saveImage(sFileName, FileManager.format.png, mImage);