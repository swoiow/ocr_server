#!/usr/bin/env bash

alias cpip="pip3 install --no-cache-dir -q -i https://pypi.tuna.tsinghua.edu.cn/simple"

set -ex;

cd /app

cpip --upgrade setuptools wheel
cpip -r ./requirements.txt

waitress-serve server:app
