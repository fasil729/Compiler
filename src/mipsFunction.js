"use strict";
export const __esModule = true;
// export const mipsFunctions = void 0;
export const mipsFunctions = {
    strConcat: "\n# strConcat -- append string\n#\n# RETURNS:\n#   None, but $s0 is updated to end of destination string buffer\n#\n# arguments:\n#   a0 -- address of destination buffer\n#   a1 -- address of source buffer\n#\n# clobbers:\n#   v0 -- current char\nstrConcat:\nlb      $v0,0($a1)              # get the current char\nbeqz    $v0,strcat_done         # is char 0? if yes, done\n\nsb      $v0,0($a0)              # store the current char\n\naddi    $a0,$a0,1               # advance destination pointer\naddi    $a1,$a1,1               # advance source pointer\nj       strConcat\n\nstrcat_done:\nsb      $zero,0($a0)            # add EOS\nadd     $s0,$a0,$0              # storing end pointer in $s0\njr      $ra                     # return\n\n",
    strCmp: "\n# strCmp -- compares two strings; a and b\n#\n# RETURNS:\n#   v0 --  0 if a == b\n#      --  1 if a > b\n#      -- -1 if a < b\n#\n# arguments:\n#   a0 -- address of first string  (a)\n#   a1 -- address of second string (b)\n#\n# clobbers:\n#   v0 -- current char\nstrCmp:\nadd     $t1,$0,$a0           # t1=first string address\nadd     $t2,$0,$a1           # t2=second string address\n\nloop:\nlb      $t3,0($t1)              #load a byte from string 1\nlb      $t4,0($t2)              #load a byte from string 2\nbeqz    $t3,checklower          #str1 is finished - if str2 is not also finished str1 < str2\nbeqz    $t4,higher              #str2 is finished -> str2 > str1\nblt     $t3,$t4,lower           #if str1 < str2 -> str1 is lower\nbgt     $t3,$t4,higher          #if str1 > str2 -> str1 is higher\naddi    $t1,$t1,1               #t1 points to the next byte of str1\naddi    $t2,$t2,1               #t2 points to the next byte of str2\n#checking for user input as user input will have an extra \"\\n\" at the end.\nlb      $t5, 0($t1)\nlb      $t6, 0($t2)\nxor \t$t0, $t5, $t6\t\t    #check if (t5 == 10 and t6 == 0) or (t5 == 0 and t6 == 10) Note: 10 = ASCII for '\\n'\nli \t    $t7, 10\nbeq \t$t0, $t7, checknewline\nj       loop\n\nchecknewline:\nbeq     $t5, $t7, stringonenewline\t\t#str1 has a newline so check the next letter of str1\nbeq     $t6, $t7, stringtwonewline\t\t#str2 is a newline so check the next letter of str2\nj       loop\n\nchecklower:\nbeqz    $t4,equal\nj       lower\n\nequal:\nli      $v0,0\njr      $ra\n\nlower:\nli      $v0,-1\njr      $ra\n\nhigher:\nli      $v0,1\njr      $ra\n\nstringonenewline:\naddi    $t1,$t1,1               #t1 points to the next byte of str1\nlb      $t5, 0($t1)\nbeqz \t$t5, equal\t\t        #check if at end of string\nj \t    higher\n\nstringtwonewline:\naddi    $t2,$t2,1               #t2 points to the next byte of str2\nlb      $t6, 0($t2)\nbeqz \t$t6, equal\t\t        #check if at end of string\nj \t    lower\n\n",
    strEmpty: "\n# strEmpty -- checks if a string is empty\n#\n# RETURNS:\n#   v0 --  1 if string is empty\n#      --  0 otherwise\n#\n#\n# arguments:\n#   a0 -- address of string to check\n#\nstrEmpty:\nlb      $t0,0($a0)              #load first char from string \nbeqz    $t0, isEmpty\nli      $t1, 10\nbne     $t0, $t1, notEmpty      #check if string is only a newline\nlb      $t0,1($a0)              #load second char from string \nbeqz    $t0, isEmpty\nj       notEmpty\n\nisEmpty:\nli      $v0, 1\njr      $ra\n\nnotEmpty:\nli      $v0, 0\njr      $ra\n",
    printArray: "\n# printArray -- prints all the contents of an Array\n#\n# RETURNS:\n#   Nothing\n#\n#\n# arguments:\n#   a0 -- address of the array to print\n#\n# clobbers:\n#   --length of list is stored at position 0 of the array\nprintArray:\naddi        $t0, $0, 0 # t0 = 0\naddi        $t1, $a0, 0 # $t1 = address of the_list\nlw          $t2, ($t1)  # $t2 = size of list\nli          $a0, '['\naddi        $v0, $0, 11\nsyscall\nbge         $t0, $t2, endPrint\n\nprintLoop:\naddi        $t3, $0, 4\nmult        $t3, $t0\nmflo        $t4\nadd         $t4, $t4, $t3 # $t4 = $t0 * 4 + 4\nadd         $t4, $t4, $t1\nlw          $a0, ($t4) # load current item value into $a0\naddi        $v0, $0, 1\nsyscall     # print current item\naddi        $t0, $t0, 1 # $t0 = $t0 + 1\nbge         $t0, $t2, endPrint\naddi        $a0, $0, 44 # print a comma - ascii code 44\naddi        $v0, $0, 11\nsyscall\naddi        $a0, $0, 32 # print a space - ascii code 32\naddi        $v0, $0, 11\nsyscall\nj           printLoop\n\nendPrint:\nli          $a0, ']'\naddi        $v0, $0, 11\nsyscall\njr          $ra",
    len: "\n# len -- calculates length of an Array\n#\n# RETURNS:\n#   v0 - length of the array\n#\n#\n# arguments:\n#   a0 -- address of the array\n#\n# clobbers:\n#   --length of list is stored at position 0 of the array\nlen:\naddi        $t0, $a0, 0 # $t0 = address of the_list\nlw          $v0, ($t0)  # $v0 = size of list\njr          $ra\n"
};
