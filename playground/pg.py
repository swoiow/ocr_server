#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

import numpy as np
import pandas as pd
from sklearn.externals import joblib
from sklearn.neighbors import KNeighborsClassifier


def load_train_data():
    uncompress_train = joblib.load("font-yh-data.jlb")
    train_df = pd.DataFrame(uncompress_train)
    _train_y = np.array(train_df["label"].tolist())
    _train_x = np.array(train_df["data"].tolist())

    return _train_x, _train_y


def load_test_data():
    uncompress_test = joblib.load("font-dejavu-testdata.jlb")
    test_df = pd.DataFrame(uncompress_test)
    _test_y = np.array(test_df["label"].tolist())
    _test_x = np.array(test_df["data"].tolist())

    return _test_x, _test_y


if not os.path.exists("models.jlb"):
    print("定义模型...")

    # 定义 knn 分类器
    knn = KNeighborsClassifier(
        n_neighbors=5,
        n_jobs=-1,
    )
    train_x, train_y = load_train_data()

    # 对标记的数据进行分类
    knn.fit(train_x, train_y)

    # 导出模型
    joblib.dump(knn, "models.jlb")

    print("导出模型...")

else:
    print("导入已存在模型...")
    knn = joblib.load("models.jlb")

test_x, test_y = load_test_data()

# 预测位置的数据
numTestSamples = test_x.shape[0]
matchCount = 0
for i in range(numTestSamples):
    predict = knn.predict([test_x[i]])
    if predict[0] == test_y[i]:
        matchCount += 1
accuracy = float(matchCount) / numTestSamples

print(accuracy)
# df = loadDataSet()
# print()
