#!/bin/bash
run_test() {
    test=$1
    max_depth=$2
    fen=$3
    > test_case/output$test.txt
    for ((i = 1; i <= $max_depth; i++)); do
        node test.js $i "$fen" >> test_case/output$test.txt
    done
}

cat ../chess.js > test.js
echo "// testing starts here" >> test.js
cat chess_test.js >> test.js

read t
for ((i = 1; i <= t; i++)); do
    read max_depth
    read fen
    run_test $i $max_depth "$fen" &
done

wait

for ((i = 1; i <= t; i++)); do
    diff test_case/expected_output$i.txt test_case/output$i.txt
done