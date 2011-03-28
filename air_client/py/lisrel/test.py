import unittest
import time

from LisrelMatrix import SymmetricMatrix, DiagonalMatrix, FullMatrix
from LisrelModel import LisrelModel
from Group import Group

from Helpers import Helper

ly_std_test = """


         LAMBDA-Y    

               ETA 1      ETA 2      ETA 3      ETA 4      ETA 5      ETA 6   
            --------   --------   --------   --------   --------   --------
    VAR 1      0.717       - -        - -        - -        - -        - - 
    VAR 2       - -       0.762       - -        - -        - -        - - 
    VAR 3       - -        - -       0.832       - -        - -        - - 
    VAR 4       - -        - -        - -        - -        - -        - - 
    VAR 5       - -        - -        - -        - -        - -        - - 
    VAR 6       - -        - -        - -        - -        - -        - - 
    VAR 7       - -        - -        - -        - -        - -        - - 
    VAR 8       - -        - -        - -        - -        - -        - - 
    VAR 9       - -        - -        - -        - -        - -        - - 

         LAMBDA-Y    

               ETA 7      ETA 8      ETA 9   
            --------   --------   --------
    VAR 1       - -        - -        - - 
    VAR 2       - -        - -        - - 
    VAR 3       - -        - -        - - 
    VAR 4       - -        - -        - - 
    VAR 5       - -        - -        - - 
    VAR 6       - -        - -        - - 
    VAR 7      0.557       - -        - - 
    VAR 8       - -       0.749       - - 
    VAR 9       - -        - -       0.732

    
"""


ga_test_txt = """

         GAMMA       

               KSI 1      KSI 2      KSI 3      KSI 4      KSI 5      KSI 6
            --------   --------   --------   --------   --------   --------
    ETA 1          1          0          0          0          0          0
    ETA 2          0          2          0          0          0          0
    ETA 3          0          0          3          0          0          0
    ETA 4          4          0          0          0          0          0
    ETA 5          0          5          0          0          0          0
    ETA 6          0          0          6          0          0          0
    ETA 7          7          0          0          0          0          0
    ETA 8          0          8          0          0          0          0
    ETA 9          0          0          9          0          0          0


"""

phi_test_txt = """

         PHI         

               KSI 1      KSI 2      KSI 3      KSI 4      KSI 5      KSI 6
            --------   --------   --------   --------   --------   --------
    KSI 1          0
    KSI 2        109          0
    KSI 3        110        111          0
    KSI 4          0          0          0         13
    KSI 5          0          0          0          0         14
    KSI 6          0          0          0          0          0         15

        """

te_test_txt = """

         THETA-EPS   

               VAR 1      VAR 2      VAR 3      VAR 4      VAR 5      VAR 6
            --------   --------   --------   --------   --------   --------
                 112        113        114          0          0          0

         THETA-EPS   

               VAR 7      VAR 8      VAR 9
            --------   --------   --------
                 118        119        120



"""


class ParameterizedMatrixTestCase(unittest.TestCase):

    lismat_out = ['    VAR 1      0.717       - -        - -        - -        - -        - - \n    VAR 2       - -       0.762       - -        - -        - -        - - \n    VAR 3       - -        - -       0.832       - -        - -        - - \n    VAR 4       - -        - -        - -        - -        - -        - - \n    VAR 5       - -        - -        - -        - -        - -        - - \n    VAR 6       - -        - -        - -        - -        - -        - - \n    VAR 7       - -        - -        - -        - -        - -        - - \n    VAR 8       - -        - -        - -        - -        - -        - - \n    VAR 9       - -        - -        - -        - -        - -        - - ',
 '    VAR 1       - -        - -        - - \n    VAR 2       - -        - -        - - \n    VAR 3       - -        - -        - - \n    VAR 4       - -        - -        - - \n    VAR 5       - -        - -        - - \n    VAR 6       - -        - -        - - \n    VAR 7      0.557       - -        - - \n    VAR 8       - -       0.749       - - \n    VAR 9       - -        - -       0.732']

    def setUp(self):
        self.mat = SymmetricMatrix('TeSt')
                 
    def test_short_name(self):
        # Make sure the short name is correctly set
        self.assertEqual(self.mat.short_name, 'TE')

    def test_re_lismat_phi(self):
        # Test regular expression that reads matrices on PHI param matrix
        self.assertEqual(self.mat.re_lismat.findall(phi_test_txt),
            ['    KSI 1          0\n    KSI 2        109          0\n    KSI 3        110        111          0\n    KSI 4          0          0          0         13\n    KSI 5          0          0          0          0         14\n    KSI 6          0          0          0          0          0         15',])
        
    def test_re_lismat_te(self):
        # Test regular expression that reads matrices on TE param matrix
        self.assertEqual(self.mat.re_lismat.findall(te_test_txt),
                ['                 112        113        114          0          0          0',
 '                 118        119        120'])
    def test_re_lismat_ly(self):
        self.assertEqual(self.mat.re_lismat.findall(ly_std_test), self.lismat_out)
        self.assertEqual(self.mat.re_cleandashes.sub('0.0',' '.join(self.lismat_out)),
            '    VAR 1      0.717      0.0      0.0      0.0      0.0      0.0\n    VAR 2      0.0      0.762      0.0      0.0      0.0      0.0\n    VAR 3      0.0      0.0      0.832      0.0      0.0      0.0\n    VAR 4      0.0      0.0      0.0      0.0      0.0      0.0\n    VAR 5      0.0      0.0      0.0      0.0      0.0      0.0\n    VAR 6      0.0      0.0      0.0      0.0      0.0      0.0\n    VAR 7      0.0      0.0      0.0      0.0      0.0      0.0\n    VAR 8      0.0      0.0      0.0      0.0      0.0      0.0\n    VAR 9      0.0      0.0      0.0      0.0      0.0      0.0     VAR 1      0.0      0.0      0.0\n    VAR 2      0.0      0.0      0.0\n    VAR 3      0.0      0.0      0.0\n    VAR 4      0.0      0.0      0.0\n    VAR 5      0.0      0.0      0.0\n    VAR 6      0.0      0.0      0.0\n    VAR 7      0.557      0.0      0.0\n    VAR 8      0.0      0.749      0.0\n    VAR 9      0.0      0.0      0.732')

    def test_join_mlist(self):
        self.assertEqual(self.mat.join_mlist(self.lismat_out), (9, 
            ['    VAR 1      0.717       - -        - -        - -        - -        - -      VAR 1       - -        - -        - - ', '    VAR 2       - -       0.762       - -        - -        - -        - -      VAR 2       - -        - -        - - ', '    VAR 3       - -        - -       0.832       - -        - -        - -      VAR 3       - -        - -        - - ', '    VAR 4       - -        - -        - -        - -        - -        - -      VAR 4       - -        - -        - - ', '    VAR 5       - -        - -        - -        - -        - -        - -      VAR 5       - -        - -        - - ', '    VAR 6       - -        - -        - -        - -        - -        - -      VAR 6       - -        - -        - - ', '    VAR 7       - -        - -        - -        - -        - -        - -      VAR 7      0.557       - -        - - ', '    VAR 8       - -        - -        - -        - -        - -        - -      VAR 8       - -       0.749       - - ', '    VAR 9       - -        - -        - -        - -        - -        - -      VAR 9       - -        - -       0.732']
            ))

    def test_parse_parameters(self):
        # Test that parse_parameters correctly extracts the parameter numbers

        self.assertEqual(self.mat.parse_parameters(phi_test_txt),
                [ 0, 109, 0, 110, 111, 0, 0, 
                  0, 0, 13, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 15])

        self.assertEqual(self.mat.parse_parameters(te_test_txt),
                [112,113,114,0,0,0,118,119,120]) 


class SymmetricMatrixTestCase(unittest.TestCase):
    
    def setUp(self):
        self.mat = SymmetricMatrix('PHI', phi_test_txt)

    def test_infer_size(self):
        self.mat.param_num_vector = self.mat.parse_parameters(phi_test_txt)
        self.mat.infer_size() # IO
        self.assertEqual(self.mat.ncols, 6)
        self.assertEqual(self.mat.nrows, 6)
        self.assertEqual(self.mat.order, 6)
        self.assertEqual(self.mat.shape, (6, 6))

    def test_read_parameter_numbers(self):
        # Test whether the following snippet from a LISREL output is correctly
        # read in as a 6x6 parameter number matrix
        should_be = [[0,109,110,0,0,0], [109, 0, 111, 0, 0, 0], 
                [110, 111, 0, 0, 0, 0], [0,0,0,13,0,0], 
                [0,0,0,0,14,0], [0,0,0,0,0,15]]        

        self.mat.read_parameter_numbers(phi_test_txt)
        self.assertEqual(self.mat.param_nums, should_be)

    def test_set_values(self):
        values = """ 0.10000D+01 -0.83273D-01  0.10000D+01 -0.71127D-01  0.37063D+00  0.10000D+01
  0.00000D+00  0.00000D+00  0.00000D+00  0.37532D-01  0.00000D+00  0.00000D+00
  0.00000D+00  0.00000D+00  0.32159D-01  0.00000D+00  0.00000D+00  0.00000D+00
  0.00000D+00  0.00000D+00  0.46088D-01"""
        should_be = [[1.0, -0.083273, -0.071126999999999996, 0.0, 0.0, 0.0],
 [-0.083273, 1.0, 0.37063000000000001, 0.0, 0.0, 0.0],
 [-0.071126999999999996, 0.37063000000000001, 1.0, 0.0, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.037532000000000003, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.032159, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.046087999999999997]]
        self.mat.set_values(values)
        #Should take tol into account but I am too lazy to loop over mat
        self.assertEqual(self.mat.values, should_be) 
        


class DiagonalMatrixTestCase(unittest.TestCase):
    
    def setUp(self):
        self.mat = DiagonalMatrix('THETA-EPS')

    def test_infer_size(self):
        self.mat.param_num_vector = self.mat.parse_parameters(te_test_txt)
        self.mat.infer_size() # IO
        self.assertEqual(self.mat.ncols, 9)
        self.assertEqual(self.mat.nrows, 9)
        self.assertEqual(self.mat.shape, (9, 9))

    def test_read_parameter_numbers(self):
        # Test whether the following snippet from a LISREL output is correctly
        # read in as a 6x6 parameter number matrix
        should_be = \
            [[112, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 113, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 114, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 118, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 119, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 120]]

        self.mat.read_parameter_numbers(te_test_txt)
        self.assertEqual(self.mat.param_nums, should_be)

    def test_set_values(self):
        values = """  0.42352D+00  0.39308D+00  0.26996D+00  0.16325D+00  0.26425D+00  0.18492D+00
  0.10000D+01  0.10000D+01  0.10000D+01"""

        should_be = [[0.42352000000000001, 0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0.39307999999999998, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0.26995999999999998, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 0.16325000000000001, 0, 0, 0, 0, 0],
 [0, 0, 0, 0, 0.26424999999999998, 0, 0, 0, 0],
 [0, 0, 0, 0, 0, 0.18492, 0, 0, 0],
 [0, 0, 0, 0, 0, 0, 1.0, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 1.0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 1.0]]

        self.mat.set_values(values)
        #Should take tol into account but I am too lazy to loop over mat
        self.assertEqual(self.mat.values, should_be) 


class FullMatrixTestCase(unittest.TestCase):
    
    def setUp(self):
        self.mat = FullMatrix('GaMma', ga_test_txt)

    def test_short_name(self):
        # Make sure the short name is correctly set
        self.assertEqual(self.mat.short_name, 'GA')

    def test_infer_size(self):
        self.mat.param_num_vector = self.mat.parse_parameters(ga_test_txt)
        self.mat.infer_size() # IO
        self.assertEqual(self.mat.ncols, 6)
        self.assertEqual(self.mat.nrows, 9)
        self.assertEqual(self.mat.shape, (9, 6))

    def test_read_parameter_numbers(self):
        # Test whether the following snippet from a LISREL output is correctly
        # read in as a 6x6 parameter number matrix

        should_be = \
            [[1, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0],
            [0, 0, 3, 0, 0, 0],
            [4, 0, 0, 0, 0, 0],
            [0, 5, 0, 0, 0, 0],
            [0, 0, 6, 0, 0, 0],
            [7, 0, 0, 0, 0, 0],
            [0, 8, 0, 0, 0, 0],
            [0, 0, 9, 0, 0, 0],]

        self.mat.read_parameter_numbers(ga_test_txt)
        self.assertEqual(self.mat.param_nums, should_be)

    def test_set_values(self):
        # Tests ability to read in parameter estimates and fixed values from
        # GA.OUT and similar
        values = """  0.71545D+00  0.00000D+00  0.00000D+00  0.10000D+01  0.00000D+00  0.00000D+00\n
  0.00000D+00  0.80182D+00  0.00000D+00  0.10000D+01  0.00000D+00  0.00000D+00\n
  0.00000D+00  0.00000D+00  0.79338D+00  0.10000D+01  0.00000D+00  0.00000D+00\n
  0.76667D+00  0.00000D+00  0.00000D+00  0.00000D+00  0.10000D+01  0.00000D+00\n
  0.00000D+00  0.82061D+00  0.00000D+00  0.00000D+00  0.10000D+01  0.00000D+00\n
  0.00000D+00  0.00000D+00  0.80665D+00  0.00000D+00  0.10000D+01  0.00000D+00\n
  0.64102D+00  0.00000D+00  0.00000D+00  0.00000D+00  0.00000D+00  0.10000D+01\n
  0.00000D+00  0.93235D+00  0.00000D+00  0.00000D+00  0.00000D+00  0.10000D+01\n
  0.00000D+00  0.00000D+00  0.86711D+00  0.00000D+00  0.00000D+00  0.10000D+01"""

        should_be = [[0.71545000000000003, 0.0, 0.0, 1.0, 0.0, 0.0],
 [0.0, 0.80181999999999998, 0.0, 1.0, 0.0, 0.0],
 [0.0, 0.0, 0.79337999999999997, 1.0, 0.0, 0.0],
 [0.76666999999999996, 0.0, 0.0, 0.0, 1.0, 0.0],
 [0.0, 0.82060999999999995, 0.0, 0.0, 1.0, 0.0],
 [0.0, 0.0, 0.80664999999999998, 0.0, 1.0, 0.0],
 [0.64102000000000003, 0.0, 0.0, 0.0, 0.0, 1.0],
 [0.0, 0.93235000000000001, 0.0, 0.0, 0.0, 1.0],
 [0.0, 0.0, 0.86711000000000005, 0.0, 0.0, 1.0]]

        self.mat.set_values(values)
        #Should take tol into account but I am too lazy to loop over mat
        self.assertEqual(self.mat.values, should_be) 

    def test_parse_standardized(self):
        self.mat.read_standardized(ly_std_test)
        self.assertEqual(self.mat.shape, (9,9))
#        self.assertEqual(self.mat.values_std_vector,
#                [0.717, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.762, 0.0, 0.0, 0.0,
#                    0.0, 0.0, 0.0, 0.832, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
#                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
#                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
#                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
#                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
#                    0.0, 0.0, 0.557, 0.0, 0.0, 0.0, 0.749, 0.0, 0.0, 0.0,
#                    0.732])

        should_be = [[0.71699999999999997, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
 [0.0, 0.76200000000000001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
 [0.0, 0.0, 0.83199999999999996, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.55700000000000005, 0.0, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.749, 0.0],
 [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.73199999999999998]]

        self.assertEqual(self.mat.values_std, should_be)


class LisrelModelTestCase(unittest.TestCase):
    def setUp(self):
        self.model_r1 = LisrelModel('TEST-R1.OUT')
    
    def test_ngroups(self):
        self.assertEqual(self.model_r1.ngroups, 38)

    @unittest.skip("Skipping re_std test to save time...")
    def test_re_std(self):
        t0 = time.time()
        res = self.model_r1.re_std.findall(self.model_r1.txt)
        elapsed = time.time() - t0 # time taken in seconds
        self.assertTrue(elapsed < 5.0) # more than five secs is really too slow
        self.assertEqual(res[35][0].strip(), 'Analysis of group 2 SE (gp36)')
        txt33 = '\n\r\n         LAMBDA-Y    \r\n\r\n               ETA 1      ETA 2      ETA 3      ETA 4      ETA 5      ETA 6   \r\n            --------   --------   --------   --------   --------   --------\r\n    VAR 1      0.764       - -        - -        - -        - -        - - \r\n    VAR 2       - -       0.874       - -        - -        - -        - - \r\n    VAR 3       - -        - -       0.827       - -        - -        - - \r\n    VAR 4       - -        - -        - -       0.932       - -        - - \r\n    VAR 5       - -        - -        - -        - -       0.949       - - \r\n    VAR 6       - -        - -        - -        - -        - -       0.984\r\n    VAR 7       - -        - -        - -        - -        - -        - - \r\n    VAR 8       - -        - -        - -        - -        - -        - - \r\n    VAR 9       - -        - -        - -        - -        - -        - - \r\n\r\n         LAMBDA-Y    \r\n\r\n               ETA 7      ETA 8      ETA 9   \r\n            --------   --------   --------\r\n    VAR 1       - -        - -        - - \r\n    VAR 2       - -        - -        - - \r\n    VAR 3       - -        - -        - - \r\n    VAR 4       - -        - -        - - \r\n    VAR 5       - -        - -        - - \r\n    VAR 6       - -        - -        - - \r\n    VAR 7       - -        - -        - - \r\n    VAR 8       - -        - -        - - \r\n    VAR 9       - -        - -        - - \r\n\r\n         GAMMA       \r\n\r\n               KSI 1      KSI 2      KSI 3      KSI 4      KSI 5      KSI 6   \r\n            --------   --------   --------   --------   --------   --------\r\n    ETA 1      0.965       - -        - -       0.261       - -        - - \r\n    ETA 2       - -       0.972       - -       0.235       - -        - - \r\n    ETA 3       - -        - -       0.971      0.237       - -        - - \r\n    ETA 4      0.974       - -        - -        - -       0.228       - - \r\n    ETA 5       - -       0.977       - -        - -       0.213       - - \r\n    ETA 6       - -        - -       0.976       - -       0.217       - - \r\n    ETA 7      0.948       - -        - -        - -        - -       0.318\r\n    ETA 8       - -       0.975       - -        - -        - -       0.224\r\n    ETA 9       - -        - -       0.971       - -        - -       0.240\r\n\r\n         '
        self.assertEqual(res[32][1], txt33)

    def test_create_groups_from_std(self):
        self.model_r1.create_groups_from_std()

        self.assertEqual(len(self.model_r1.groups), 38)
        self.assertEqual(len(self.model_r1.groups), self.model_r1.ngroups)
        
        firstels = [0.751, 0.751, 0.719, 0.719, 0.734, 0.734, 0.719, 0.719,
                0.737, 0.737, 0.717, 0.717, 0.717, 0.717, 0.682, 0.682, 0.600,
                0.600, 0.596, 0.596, 0.723, 0.723, 0.698, 0.698, 0.687, 0.687,
                0.755, 0.755, 0.714, 0.714, 0.719, 0.719, 0.764, 0.764, 0.759,
                0.759, 0.707, 0.707]

        for i in range(38):
            grp = self.model_r1.groups[i]
            self.assertEqual(type(grp), Group)
            fe = grp.matrices[0].values_std[0][0]
            self.assertEqual(fe, firstels[i])



class GroupTestCase(unittest.TestCase):
    def setUp(self):
        self.mod1 = LisrelModel('TEST-R1.OUT')
        self.grp1 = Group('Some test group', 2)
        self.test_txt = '\n\r\n         LAMBDA-Y    \r\n\r\n               ETA 1      ETA 2      ETA 3      ETA 4      ETA 5      ETA 6   \r\n            --------   --------   --------   --------   --------   --------\r\n    VAR 1      0.759       - -        - -        - -        - -        - - \r\n    VAR 2       - -       0.846       - -        - -        - -        - - \r\n    VAR 3       - -        - -       0.879       - -        - -        - - \r\n    VAR 4       - -        - -        - -        - -        - -        - - \r\n    VAR 5       - -        - -        - -        - -        - -        - - \r\n    VAR 6       - -        - -        - -        - -        - -        - - \r\n    VAR 7       - -        - -        - -        - -        - -        - - \r\n    VAR 8       - -        - -        - -        - -        - -        - - \r\n    VAR 9       - -        - -        - -        - -        - -        - - \r\n\r\n         LAMBDA-Y    \r\n\r\n               ETA 7      ETA 8      ETA 9   \r\n            --------   --------   --------\r\n    VAR 1       - -        - -        - - \r\n    VAR 2       - -        - -        - - \r\n    VAR 3       - -        - -        - - \r\n    VAR 4       - -        - -        - - \r\n    VAR 5       - -        - -        - - \r\n    VAR 6       - -        - -        - - \r\n    VAR 7      0.702       - -        - - \r\n    VAR 8       - -       0.832       - - \r\n    VAR 9       - -        - -       0.869\r\n\r\n         GAMMA       \r\n\r\n               KSI 1      KSI 2      KSI 3      KSI 4      KSI 5      KSI 6   \r\n            --------   --------   --------   --------   --------   --------\r\n    ETA 1      0.965       - -        - -       0.261       - -        - - \r\n    ETA 2       - -       0.972       - -       0.235       - -        - - \r\n    ETA 3       - -        - -       0.971      0.237       - -        - - \r\n    ETA 4      0.974       - -        - -        - -       0.228       - - \r\n    ETA 5       - -       0.977       - -        - -       0.213       - - \r\n    ETA 6       - -        - -       0.976       - -       0.217       - - \r\n    ETA 7      0.948       - -        - -        - -        - -       0.318\r\n    ETA 8       - -       0.975       - -        - -        - -       0.224\r\n    ETA 9       - -        - -       0.971       - -        - -       0.240\r\n\r\n         '

    def test_create_matrices(self):
        self.grp1.create_matrices(self.test_txt)
        
        self.assertEqual([m.name for m in self.grp1.matrices], ['LAMBDA-Y',
            'GAMMA'])
        
        for i in range(2):
            self.assertEqual(type(self.grp1.matrices[i]), FullMatrix)

        ly = self.grp1.matrices[0]

        #Helper.pmat(ly.values_std)

        self.assertEqual(ly.shape, (9, 9))
        self.assertEqual(ly.values_std[3][3], 0.0)
        self.assertEqual(ly.values_std[5][8], 0.0)
        self.assertEqual(ly.values_std[0][0], 0.759)
        self.assertEqual(ly.values_std[1][1], 0.846)
        self.assertEqual(ly.values_std[7][7], 0.832)
        self.assertEqual(ly.values_std[8][8], 0.869)

        ga = self.grp1.matrices[1]
        #Helper.pmat(ga.values_std)
        self.assertEqual(ga.shape, (9, 6))
        self.assertEqual(ga.values_std[3][3], 0.0)
        self.assertEqual(ga.values_std[2][2], 0.971)
        self.assertEqual(ga.values_std[2][3], 0.237)
        

    def test_split_matrices(self):
        res = self.grp1.split_matrices(self.test_txt)
        self.assertEqual(len(res), 2)
        self.assertEqual(res[0]['name'], 'LAMBDA-Y')
        self.assertEqual(res[1]['name'], 'GAMMA')
        self.assertEqual(res[0]['txt_std'], 'ETA 1      ETA 2      ETA 3      ETA 4      ETA 5      ETA 6   \r\n            --------   --------   --------   --------   --------   --------\r\n    VAR 1      0.759       - -        - -        - -        - -        - - \r\n    VAR 2       - -       0.846       - -        - -        - -        - - \r\n    VAR 3       - -        - -       0.879       - -        - -        - - \r\n    VAR 4       - -        - -        - -        - -        - -        - - \r\n    VAR 5       - -        - -        - -        - -        - -        - - \r\n    VAR 6       - -        - -        - -        - -        - -        - - \r\n    VAR 7       - -        - -        - -        - -        - -        - - \r\n    VAR 8       - -        - -        - -        - -        - -        - - \r\n    VAR 9       - -        - -        - -        - -        - -        - -\r\n\r\nETA 7      ETA 8      ETA 9   \r\n            --------   --------   --------\r\n    VAR 1       - -        - -        - - \r\n    VAR 2       - -        - -        - - \r\n    VAR 3       - -        - -        - - \r\n    VAR 4       - -        - -        - - \r\n    VAR 5       - -        - -        - - \r\n    VAR 6       - -        - -        - - \r\n    VAR 7      0.702       - -        - - \r\n    VAR 8       - -       0.832       - - \r\n    VAR 9       - -        - -       0.869')
        

if __name__ == '__main__':
    unittest.main()