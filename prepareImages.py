import os
from os import listdir
from os.path import isdir, relpath, dirname, splitext
from os.path import join as joinpath
from os.path import exists as pathexists
import json
import math
from PIL import Image

LN2 = math.log(2)

MAX_IMAGE_PIXELS = 1024

imagesSource = './src/images'
imagesTarget = './dist/images'
urlRoot = './dist'

def main():
  folders = [item for item in listdir(imagesSource) if isdir(joinpath(imagesSource, item))]

  output = []
  for folder in folders:
    images = listdir(joinpath(imagesSource, folder))
    sessionImages = []
    print "processing folder %s (%s)" % (folder, len(images))
    for image in images:
      print image
      if image == ".DS_Store":
        continue
      imgPath = joinpath(imagesSource, folder, image)
      targetImagePath = joinpath(imagesTarget, folder, image)
      targetImagePath = splitext(targetImagePath)[0] + ".png"
      imageDir = dirname(targetImagePath)
      imageUrl = relpath(targetImagePath, urlRoot)

      if not pathexists(imageDir):
        os.makedirs(imageDir)

      im = Image.open(imgPath)
      original_width, original_height = im.size

      scale = 1
      if ( im.width > MAX_IMAGE_PIXELS or im.height > MAX_IMAGE_PIXELS ):
        scale = float(MAX_IMAGE_PIXELS) / max( im.width, im.height )
      width = floorPowerOfTwo( scale * im.width )
      height = floorPowerOfTwo( scale * im.height )

      resizedPixels = (int(width), int(height))

      im = im.resize(resizedPixels, resample=Image.LANCZOS)
      im.convert('RGB').save(targetImagePath)

      sessionImages.append({
        'url': imageUrl,
        'original_width': original_width,
        'original_height': original_height,
        'original_ratio': float(original_width) / original_height,
        'width': width,
        'height': height,
        'ratio': float(width)/height,
      })
    
    output.append(sessionImages)

  with open(joinpath(imagesTarget, 'map.json'), 'w+') as f:
    json.dump(output, f, indent=2)

# from https://github.com/mrdoob/three.js/blob/5e6d7106d326575ae7e000a9a7fd4bc1c6c70460/src/math/Math.js#L140
def floorPowerOfTwo(value):
  return math.pow( 2, math.floor( math.log( value ) / LN2 ) )

main()