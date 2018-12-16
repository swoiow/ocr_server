#!/usr/bin/env python
# -*- coding: utf-8 -*-

from sys import platform


if platform == "win32":
    from os import environ


    environ.setdefault("FORKED_BY_MULTIPROCESSING", "1")

__doc__ = """https://docs.celeryproject.org/en/latest/

https://zhuanlan.zhihu.com/p/22304455

issues:
    https://github.com/celery/celery/issues/4081
"""
