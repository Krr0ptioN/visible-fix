#!/bin/bash
# Run VisibleFix Market Research Marimo Notebook
cd "$(dirname "$0")"
marimo edit --sandbox --watch research_notebook.py 
