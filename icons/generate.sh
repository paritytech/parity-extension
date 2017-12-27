#!/bin/bash

set -xe

SIZES=(16 19 32 48 64 76 128 256 1024)

for size in ${SIZES[@]}
do
  inkscape -z -e icon-${size}.png -w $size -h $size ./icon.svg
done
