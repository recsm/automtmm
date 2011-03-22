import random
import json
import sys
import os

countries  = ['UK', 'France', 'Yonderland', 'Cuba', 'New Amsterdam']
parameters = ['pr1', 'pr2', 'pr3', 'pr4', 'pr5']
groups     = ['group1', 'group2', 'group3', 'group4']

def main():
    """
    Parse a lisrel OUT file from Mac to a usable matrix
    """
    if len(sys.argv) != 2:
        sys.exit('Usage: %s /path/to/OUT' % sys.argv[0])

    if not os.path.exists(sys.argv[1]):
        sys.exit('ERROR: OUT file "%s" was not found' % sys.argv[1])
    
    out_file = sys.argv[1]
    list = []
    
    for country in countries:
        for parameter in parameters:
            for group in groups:
                rand = random.random()
                list.append({'country'   : country,
                             'parameter' : parameter,
                             'group'     : group,
                             'value'     : rand })  
               
    out_json = json.dumps(list)
    
    fileObj = open(out_file + '.JSON',"w") 
    fileObj.write(out_json)
    fileObj.close()

if __name__ == "__main__":
    main()