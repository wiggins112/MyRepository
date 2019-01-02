#!/bin/sh
npm run build
if [ ! -n "$1" ]; then
	version=`grep version package.json | awk -F '"' '{print $4}'`
	num=`echo $version | awk -F '.' '{print $NF}'`
	next_num=$(($num+1))
	next_version="${version%.*}.$next_num"
else
	next_version=$1
fi

# sed -i -E "s/version\": \".+\"/version\": \"$next_version\"/g" package.json

git add .
git commit -m"v$next_version"
