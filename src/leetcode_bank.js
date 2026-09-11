/**
 * LeetCode Curated Problem Bank
 * Standard algorithmic problems with examples, constraints, test cases,
 * multi-language boilerplates (Python, C++, Java, C), and realistic bot solutions.
 */

export const LEETCODE_PROBLEM_BANK = [
  {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'Meta', 'Apple'],
    tags: ['Array', 'Hash Table'],
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\\n\\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\\n\\nYou can return the answer in any order.',
    examples: [
      {
        id: 1,
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        id: 2,
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        id: 3,
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10⁴',
      '-10⁹ <= nums[i] <= 10⁹',
      '-10⁹ <= target <= 10⁹',
      'Only one valid answer exists.'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'nums = [2,7,11,15], target = 9',
        expected: '[0,1]',
        actual: '[0,1]'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'nums = [3,2,4], target = 6',
        expected: '[1,2]',
        actual: '[1,2]'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'nums = [3,3], target = 6',
        expected: '[0,1]',
        actual: '[0,1]'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Implement your solution
        pass

# Test Run
s = Solution()
print(s.twoSum([2, 7, 11, 15], 9))`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Implement your solution
        return {};
    }
};

int main() {
    Solution s;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> res = s.twoSum(nums, 9);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Implement your solution
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int[] res = twoSum(nums, 9);
        System.out.println(Arrays.toString(res));
    }
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Implement your solution
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    res[0] = 0; res[1] = 1;
    return res;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int returnSize;
    int* res = twoSum(nums, 4, 9, &returnSize);
    printf("[%d, %d]\\n", res[0], res[1]);
    free(res);
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
print(Solution().twoSum([2, 7, 11, 15], 9))`,
        language: 'python',
        score: 98,
        accuracy_score: 100,
        feedback: 'Optimal O(n) time and O(n) space hash map solution.'
      },
      {
        code: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.count(comp)) return {seen[comp], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    Solution s;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> res = s.twoSum(nums, 9);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
    return 0;
}`,
        language: 'cpp',
        score: 96,
        accuracy_score: 100,
        feedback: 'Clean standard C++ hash map solution with linear runtime.'
      }
    ]
  },
  {
    id: 'valid-parentheses',
    title: '20. Valid Parentheses',
    difficulty: 'Easy',
    companies: ['Meta', 'Amazon', 'Microsoft', 'Bloomberg'],
    tags: ['String', 'Stack'],
    description:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\\n\\nAn input string is valid if:\\n1. Open brackets must be closed by the same type of brackets.\\n2. Open brackets must be closed in the correct order.\\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      {
        id: 1,
        input: 's = "()"',
        output: 'true',
        explanation: 'The brackets are matched and closed in the correct order.'
      },
      {
        id: 2,
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All bracket pairs are correctly nested and closed.'
      },
      {
        id: 3,
        input: 's = "(]"',
        output: 'false',
        explanation: 'Parenthesis closed with square bracket is invalid.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10⁴',
      's consists of parentheses only: ()[]{}'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 's = "()"',
        expected: 'true',
        actual: 'true'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 's = "()[]{}"',
        expected: 'true',
        actual: 'true'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 's = "(]"',
        expected: 'false',
        actual: 'false'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Implement your solution
        pass

# Test Run
s = Solution()
print(s.isValid("()[]{}"))`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Implement your solution
        return true;
    }
};

int main() {
    Solution sol;
    cout << (sol.isValid("()[]{}") ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Implement your solution
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isValid("()[]{}"));
    }
}`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

bool isValid(char* s) {
    // Implement your solution
    return true;
}

int main() {
    printf("%s\\n", isValid("()[]{}") ? "true" : "false");
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in pairs:
                if not stack or stack[-1] != pairs[char]:
                    return False
                stack.pop()
            else:
                stack.append(char)
        return len(stack) == 0
print(Solution().isValid("()[]{}"))`,
        language: 'python',
        score: 97,
        accuracy_score: 100,
        feedback: 'Classic stack matching achieving O(n) time and O(n) space.'
      }
    ]
  },
  {
    id: 'best-time-stock',
    title: '121. Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple'],
    tags: ['Array', 'Dynamic Programming'],
    description:
      'You are given an array `prices` where `prices[i]` is the price of a given stock on the `iᵗʰ` day.\\n\\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\\n\\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.',
    examples: [
      {
        id: 1,
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        id: 2,
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and max profit = 0.'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10⁵',
      '0 <= prices[i] <= 10⁴'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'prices = [7,1,5,3,6,4]',
        expected: '5',
        actual: '5'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'prices = [7,6,4,3,1]',
        expected: '0',
        actual: '0'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Implement your solution
        pass

# Test Run
s = Solution()
print(s.maxProfit([7, 1, 5, 3, 6, 4]))`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Implement your solution
        return 0;
    }
};

int main() {
    Solution s;
    vector<int> p = {7, 1, 5, 3, 6, 4};
    cout << s.maxProfit(p) << endl;
    return 0;
}`,
      java: `public class Main {
    public static int maxProfit(int[] prices) {
        // Implement your solution
        return 0;
    }

    public static void main(String[] args) {
        int[] prices = {7, 1, 5, 3, 6, 4};
        System.out.println(maxProfit(prices));
    }
}`,
      c: `#include <stdio.h>

int maxProfit(int* prices, int pricesSize) {
    // Implement your solution
    return 0;
}

int main() {
    int prices[] = {7, 1, 5, 3, 6, 4};
    printf("%d\\n", maxProfit(prices, 6));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
        return max_profit
print(Solution().maxProfit([7, 1, 5, 3, 6, 4]))`,
        language: 'python',
        score: 99,
        accuracy_score: 100,
        feedback: 'Single-pass greedy solution with optimal O(n) time and O(1) space complexity.'
      }
    ]
  },
  {
    id: 'longest-substring',
    title: '3. Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Meta', 'Apple'],
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      {
        id: 1,
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        id: 2,
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        id: 3,
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10⁴',
      's consists of English letters, digits, symbols and spaces.'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 's = "abcabcbb"',
        expected: '3',
        actual: '3'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 's = "bbbbb"',
        expected: '1',
        actual: '1'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 's = "pwwkew"',
        expected: '3',
        actual: '3'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Implement your sliding window solution
        pass

# Test Run
s = Solution()
print(s.lengthOfLongestSubstring("abcabcbb"))`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Implement your sliding window solution
        return 0;
    }
};

int main() {
    Solution sol;
    cout << sol.lengthOfLongestSubstring("abcabcbb") << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Implement your solution
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb"));
    }
}`,
      c: `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    // Implement your solution
    return 0;
}

int main() {
    printf("%d\\n", lengthOfLongestSubstring("abcabcbb"));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right, char in enumerate(s):
            if char in char_map and char_map[char] >= left:
                left = char_map[char] + 1
            char_map[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len
print(Solution().lengthOfLongestSubstring("abcabcbb"))`,
        language: 'python',
        score: 98,
        accuracy_score: 100,
        feedback: 'Optimal sliding window with hash map lookup: O(n) time, O(min(m, n)) space.'
      }
    ]
  },
  {
    id: 'container-with-most-water',
    title: '11. Container With Most Water',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Meta', 'Adobe'],
    tags: ['Array', 'Two Pointers', 'Greedy'],
    description:
      'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `iᵗʰ` line are `(i, 0)` and `(i, height[i])`.\\n\\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\\n\\nReturn the maximum amount of water a container can store.',
    examples: [
      {
        id: 1,
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The max area is formed between index 1 and index 8: min(8, 7) * (8 - 1) = 7 * 7 = 49.'
      },
      {
        id: 2,
        input: 'height = [1,1]',
        output: '1',
        explanation: 'min(1, 1) * (1 - 0) = 1.'
      }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10⁵',
      '0 <= height[i] <= 10⁴'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        expected: '49',
        actual: '49'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'height = [1,1]',
        expected: '1',
        actual: '1'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Implement your two-pointer solution
        pass

# Test Run
s = Solution()
print(s.maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // Implement your solution
        return 0;
    }
};

int main() {
    Solution s;
    vector<int> h = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << s.maxArea(h) << endl;
    return 0;
}`,
      java: `public class Main {
    public static int maxArea(int[] height) {
        // Implement your solution
        return 0;
    }

    public static void main(String[] args) {
        int[] h = {1, 8, 6, 2, 5, 4, 8, 3, 7};
        System.out.println(maxArea(h));
    }
}`,
      c: `#include <stdio.h>

int maxArea(int* height, int heightSize) {
    // Implement your solution
    return 0;
}

int main() {
    int h[] = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    printf("%d\\n", maxArea(h, 9));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        max_water = 0
        while left < right:
            h = min(height[left], height[right])
            max_water = max(max_water, h * (right - left))
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water
print(Solution().maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))`,
        language: 'python',
        score: 98,
        accuracy_score: 100,
        feedback: 'Optimal two-pointer approach achieving linear O(n) time and O(1) space complexity.'
      }
    ]
  },
  {
    id: 'maximum-subarray',
    title: '53. Maximum Subarray',
    difficulty: 'Medium',
    companies: ['Amazon', 'LinkedIn', 'Apple', 'Google'],
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    description:
      'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    examples: [
      {
        id: 1,
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        id: 2,
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      },
      {
        id: 3,
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10⁵',
      '-10⁴ <= nums[i] <= 10⁴'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        expected: '6',
        actual: '6'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'nums = [1]',
        expected: '1',
        actual: '1'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'nums = [5,4,-1,7,8]',
        expected: '23',
        actual: '23'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Implement Kadane's algorithm
        pass

# Test Run
s = Solution()
print(s.maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Implement Kadane's algorithm
        return 0;
    }
};

int main() {
    Solution s;
    vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << s.maxSubArray(nums) << endl;
    return 0;
}`,
      java: `public class Main {
    public static int maxSubArray(int[] nums) {
        // Implement Kadane's algorithm
        return 0;
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(maxSubArray(nums));
    }
}`,
      c: `#include <stdio.h>

int maxSubArray(int* nums, int numsSize) {
    // Implement Kadane's algorithm
    return 0;
}

int main() {
    int nums[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    printf("%d\\n", maxSubArray(nums, 9));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur_sum = 0
        max_sum = nums[0]
        for x in nums:
            cur_sum = max(x, cur_sum + x)
            max_sum = max(max_sum, cur_sum)
        return max_sum
print(Solution().maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
        language: 'python',
        score: 99,
        accuracy_score: 100,
        feedback: "Optimal Kadane's algorithm implementation with O(n) time and O(1) space."
      }
    ]
  },
  {
    id: 'palindrome-number',
    title: '9. Palindrome Number',
    difficulty: 'Easy',
    companies: ['Amazon', 'Apple', 'Google'],
    tags: ['Math'],
    description:
      'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\\n\\nAn integer is a palindrome when it reads the same forward and backward.\\n\\nFor example, `121` is a palindrome while `123` is not.',
    examples: [
      {
        id: 1,
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        id: 2,
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      },
      {
        id: 3,
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.'
      }
    ],
    constraints: [
      '-2³¹ <= x <= 2³¹ - 1'
    ],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'x = 121',
        expected: 'true',
        actual: 'true'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'x = -121',
        expected: 'false',
        actual: 'false'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'x = 10',
        expected: 'false',
        actual: 'false'
      }
    ],
    boilerplates: {
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Implement without converting to string (optimal)
        pass

# Test Run
s = Solution()
print(s.isPalindrome(121))`,
      cpp: `#include <iostream>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // Implement your solution
        return true;
    }
};

int main() {
    Solution s;
    cout << (s.isPalindrome(121) ? "true" : "false") << endl;
    return 0;
}`,
      java: `public class Main {
    public static boolean isPalindrome(int x) {
        // Implement your solution
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome(121));
    }
}`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool isPalindrome(int x) {
    // Implement your solution
    return true;
}

int main() {
    printf("%s\\n", isPalindrome(121) ? "true" : "false");
    return 0;
}`
    },
    botSolutions: [
      {
        code: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        rev = 0
        while x > rev:
            rev = rev * 10 + x % 10
            x //= 10
        return x == rev or x == rev // 10
print(Solution().isPalindrome(121))`,
        language: 'python',
        score: 98,
        accuracy_score: 100,
        feedback: 'Mathematical half-reversal solution without string conversion. O(log10 n) time, O(1) space.'
      }
    ]
  }
];
