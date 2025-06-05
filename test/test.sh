#!/bin/bash
cat ../chess.js > test.js
echo "// testing starts here" >> test.js
cat chess_test.js >> test.js

> out.txt
for ((i = 1; i < 6; i++)); do
    node test.js $i >> out.txt
done

diff expected.txt out.txt