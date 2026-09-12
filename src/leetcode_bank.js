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
  },
  {
    id: 'py-hello-world',
    title: 'P1. Hello World & Greeter',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Strings', 'I/O'],
    description:
      'Welcome to Python foundations! In this introductory problem, write a function `greet(name: str) -> str` that takes a person\'s `name` as input and returns the greeting: `"Hello, <name>!"`.\n\nEnsure exact punctuation and spacing: "Hello, " followed by the name and an exclamation mark.',
    examples: [
      {
        id: 1,
        input: 'name = "Alice"',
        output: '"Hello, Alice!"',
        explanation: 'Greets Alice formatted correctly.'
      },
      {
        id: 2,
        input: 'name = "World"',
        output: '"Hello, World!"',
        explanation: 'Classic Hello World greeting.'
      },
      {
        id: 3,
        input: 'name = "CodeArena"',
        output: '"Hello, CodeArena!"',
        explanation: 'Greets CodeArena.'
      }
    ],
    constraints: ['1 <= len(name) <= 100', 'name contains printable ASCII characters.'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'name = "Alice"',
        expected: 'Hello, Alice!',
        actual: 'Hello, Alice!'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'name = "World"',
        expected: 'Hello, World!',
        actual: 'Hello, World!'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'name = "CodeArena"',
        expected: 'Hello, CodeArena!',
        actual: 'Hello, CodeArena!'
      }
    ],
    boilerplates: {
      python: `def greet(name: str) -> str:
    # Return "Hello, <name>!"
    return ""

# Test Run
print(greet("Alice"))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << greet("Alice") << endl;
    return 0;
}`,
      java: `public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("Alice"));
    }
}`,
      c: `#include <stdio.h>

void greet(const char* name) {
    printf("Hello, %s!\\n", name);
}

int main() {
    greet("Alice");
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Alice"))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Clean O(1) Python f-string greeting.'
      }
    ]
  },
  {
    id: 'py-even-odd',
    title: 'P2. Even or Odd Number Checker',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Conditionals', 'Math'],
    description:
      'Given an integer `n`, determine whether the number is even or odd.\n\nReturn `"Even"` if `n` is divisible by 2 with no remainder, and `"Odd"` otherwise.',
    examples: [
      {
        id: 1,
        input: 'n = 4',
        output: '"Even"',
        explanation: '4 is divisible by 2.'
      },
      {
        id: 2,
        input: 'n = 7',
        output: '"Odd"',
        explanation: '7 leaves a remainder of 1 when divided by 2.'
      },
      {
        id: 3,
        input: 'n = 0',
        output: '"Even"',
        explanation: '0 is an even number.'
      }
    ],
    constraints: ['-10^6 <= n <= 10^6'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'n = 4',
        expected: 'Even',
        actual: 'Even'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'n = 7',
        expected: 'Odd',
        actual: 'Odd'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'n = 0',
        expected: 'Even',
        actual: 'Even'
      }
    ],
    boilerplates: {
      python: `def check_even_odd(n: int) -> str:
    # Return "Even" or "Odd"
    pass

# Test Run
print(check_even_odd(4))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string checkEvenOdd(int n) {
    return (n % 2 == 0) ? "Even" : "Odd";
}

int main() {
    cout << checkEvenOdd(4) << endl;
    return 0;
}`,
      java: `public class Main {
    public static String checkEvenOdd(int n) {
        return (n % 2 == 0) ? "Even" : "Odd";
    }

    public static void main(String[] args) {
        System.out.println(checkEvenOdd(4));
    }
}`,
      c: `#include <stdio.h>

const char* checkEvenOdd(int n) {
    return (n % 2 == 0) ? "Even" : "Odd";
}

int main() {
    printf("%s\\n", checkEvenOdd(4));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def check_even_odd(n: int) -> str:
    return "Even" if n % 2 == 0 else "Odd"

print(check_even_odd(4))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Optimal O(1) modulo parity check.'
      }
    ]
  },
  {
    id: 'py-reverse-string',
    title: 'P3. Reverse a String',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Strings', 'Slicing'],
    description:
      'Given a string `s`, return the reversed string.\n\nIn Python, you can utilize slicing with a negative step (`s[::-1]`) or iterative character accumulation.',
    examples: [
      {
        id: 1,
        input: 's = "python"',
        output: '"nohtyp"',
        explanation: 'Characters are reversed.'
      },
      {
        id: 2,
        input: 's = "arena"',
        output: '"anera"',
        explanation: 'Reverses arena.'
      },
      {
        id: 3,
        input: 's = "a"',
        output: '"a"',
        explanation: 'Single character remains identical.'
      }
    ],
    constraints: ['0 <= len(s) <= 10^4'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 's = "python"',
        expected: 'nohtyp',
        actual: 'nohtyp'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 's = "arena"',
        expected: 'anera',
        actual: 'anera'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 's = "a"',
        expected: 'a',
        actual: 'a'
      }
    ],
    boilerplates: {
      python: `def reverse_string(s: str) -> str:
    # Return the reversed string
    return ""

# Test Run
print(reverse_string("python"))`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    cout << reverseString("python") << endl;
    return 0;
}`,
      java: `public class Main {
    public static String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }

    public static void main(String[] args) {
        System.out.println(reverseString("python"));
    }
}`,
      c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s) {
    int i = 0, j = strlen(s) - 1;
    while (i < j) {
        char temp = s[i];
        s[i++] = s[j];
        s[j--] = temp;
    }
}

int main() {
    char str[] = "python";
    reverseString(str);
    printf("%s\\n", str);
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def reverse_string(s: str) -> str:
    return s[::-1]

print(reverse_string("python"))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Idiomatic Python slice reversal O(n) time.'
      }
    ]
  },
  {
    id: 'py-sum-list',
    title: 'P4. Sum of List Elements',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Lists', 'Loops'],
    description:
      'Given a list of integers `nums`, compute and return the total sum of all numbers.\n\nPractice writing a loop to accumulate the total, or use Python\'s built-in `sum()` function.',
    examples: [
      {
        id: 1,
        input: 'nums = [1, 2, 3, 4, 5]',
        output: '15',
        explanation: '1 + 2 + 3 + 4 + 5 = 15.'
      },
      {
        id: 2,
        input: 'nums = [-2, 5, 10]',
        output: '13',
        explanation: '-2 + 5 + 10 = 13.'
      },
      {
        id: 3,
        input: 'nums = []',
        output: '0',
        explanation: 'Sum of empty list is 0.'
      }
    ],
    constraints: ['0 <= len(nums) <= 10^4', '-10^4 <= nums[i] <= 10^4'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'nums = [1, 2, 3, 4, 5]',
        expected: '15',
        actual: '15'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'nums = [-2, 5, 10]',
        expected: '13',
        actual: '13'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'nums = []',
        expected: '0',
        actual: '0'
      }
    ],
    boilerplates: {
      python: `def sum_list(nums: list[int]) -> int:
    # Compute sum of all items in nums
    return 0

# Test Run
print(sum_list([1, 2, 3, 4, 5]))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int sumList(const vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    return total;
}

int main() {
    cout << sumList({1, 2, 3, 4, 5}) << endl;
    return 0;
}`,
      java: `public class Main {
    public static int sumList(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sumList(new int[]{1, 2, 3, 4, 5}));
    }
}`,
      c: `#include <stdio.h>

int sumList(const int* nums, int size) {
    int total = 0;
    for (int i = 0; i < size; i++) total += nums[i];
    return total;
}

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    printf("%d\\n", sumList(arr, 5));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def sum_list(nums: list[int]) -> int:
    total = 0
    for x in nums:
        total += x
    return total

print(sum_list([1, 2, 3, 4, 5]))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Linear O(n) iterative accumulator.'
      }
    ]
  },
  {
    id: 'py-largest-three',
    title: 'P5. Find Largest of Three Numbers',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Conditionals'],
    description:
      'Given three numbers `a`, `b`, and `c`, return the largest value among them without using the built-in `max()` function.\n\nUse conditional `if-elif-else` branches to determine the largest value.',
    examples: [
      {
        id: 1,
        input: 'a = 10, b = 25, c = 15',
        output: '25',
        explanation: '25 is the greatest of the three.'
      },
      {
        id: 2,
        input: 'a = -5, b = -20, c = -1',
        output: '-1',
        explanation: '-1 is greater than -5 and -20.'
      },
      {
        id: 3,
        input: 'a = 7, b = 7, c = 7',
        output: '7',
        explanation: 'All values are equal.'
      }
    ],
    constraints: ['-10^9 <= a, b, c <= 10^9'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'a = 10, b = 25, c = 15',
        expected: '25',
        actual: '25'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'a = -5, b = -20, c = -1',
        expected: '-1',
        actual: '-1'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'a = 7, b = 7, c = 7',
        expected: '7',
        actual: '7'
      }
    ],
    boilerplates: {
      python: `def find_largest(a: int, b: int, c: int) -> int:
    # Return largest of a, b, c without built-in max()
    pass

# Test Run
print(find_largest(10, 25, 15))`,
      cpp: `#include <iostream>
using namespace std;

int findLargest(int a, int b, int c) {
    if (a >= b && a >= c) return a;
    if (b >= a && b >= c) return b;
    return c;
}

int main() {
    cout << findLargest(10, 25, 15) << endl;
    return 0;
}`,
      java: `public class Main {
    public static int findLargest(int a, int b, int c) {
        if (a >= b && a >= c) return a;
        if (b >= a && b >= c) return b;
        return c;
    }

    public static void main(String[] args) {
        System.out.println(findLargest(10, 25, 15));
    }
}`,
      c: `#include <stdio.h>

int findLargest(int a, int b, int c) {
    if (a >= b && a >= c) return a;
    if (b >= a && b >= c) return b;
    return c;
}

int main() {
    printf("%d\\n", findLargest(10, 25, 15));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def find_largest(a: int, b: int, c: int) -> int:
    if a >= b and a >= c:
        return a
    elif b >= a and b >= c:
        return b
    else:
        return c

print(find_largest(10, 25, 15))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Optimal O(1) comparison logic.'
      }
    ]
  },
  {
    id: 'py-count-vowels',
    title: 'P6. Count Vowels in a String',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Strings', 'Counting'],
    description:
      'Given a string `s`, count and return the total number of vowels (`\'a\'`, `\'e\'`, `\'i\'`, `\'o\'`, `\'u\'`).\n\nThe check should be case-insensitive (e.g., both `\'A\'` and `\'a\'` are counted as vowels).',
    examples: [
      {
        id: 1,
        input: 's = "hello world"',
        output: '3',
        explanation: 'Vowels: e, o, o (total 3).'
      },
      {
        id: 2,
        input: 's = "Python"',
        output: '1',
        explanation: 'Vowel: o (total 1).'
      },
      {
        id: 3,
        input: 's = "rhythm"',
        output: '0',
        explanation: 'No vowels present.'
      }
    ],
    constraints: ['0 <= len(s) <= 10^4'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 's = "hello world"',
        expected: '3',
        actual: '3'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 's = "Python"',
        expected: '1',
        actual: '1'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 's = "rhythm"',
        expected: '0',
        actual: '0'
      }
    ],
    boilerplates: {
      python: `def count_vowels(s: str) -> int:
    # Count vowels (a, e, i, o, u) case-insensitively
    return 0

# Test Run
print(count_vowels("hello world"))`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int countVowels(string s) {
    int count = 0;
    for (char c : s) {
        char lower = tolower(c);
        if (lower == 'a' || lower == 'e' || lower == 'i' || lower == 'o' || lower == 'u') count++;
    }
    return count;
}

int main() {
    cout << countVowels("hello world") << endl;
    return 0;
}`,
      java: `public class Main {
    public static int countVowels(String s) {
        int count = 0;
        for (char c : s.toLowerCase().toCharArray()) {
            if ("aeiou".indexOf(c) != -1) count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countVowels("hello world"));
    }
}`,
      c: `#include <stdio.h>
#include <ctype.h>

int countVowels(const char* s) {
    int count = 0;
    while (*s) {
        char c = tolower(*s);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') count++;
        s++;
    }
    return count;
}

int main() {
    printf("%d\\n", countVowels("hello world"));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def count_vowels(s: str) -> int:
    vowels = set("aeiouAEIOU")
    return sum(1 for ch in s if ch in vowels)

print(count_vowels("hello world"))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'O(n) time hash set vowel frequency check.'
      }
    ]
  },
  {
    id: 'py-factorial',
    title: 'P7. Factorial of a Number',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Math', 'Recursion', 'Loops'],
    description:
      'Given a non-negative integer `n`, compute and return its factorial `n!`.\n\nFactorial is defined as: `n! = n * (n - 1) * ... * 1`. By mathematical convention, `0! = 1`.',
    examples: [
      {
        id: 1,
        input: 'n = 5',
        output: '120',
        explanation: '5 * 4 * 3 * 2 * 1 = 120.'
      },
      {
        id: 2,
        input: 'n = 0',
        output: '1',
        explanation: '0! is defined as 1.'
      },
      {
        id: 3,
        input: 'n = 3',
        output: '6',
        explanation: '3 * 2 * 1 = 6.'
      }
    ],
    constraints: ['0 <= n <= 20'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'n = 5',
        expected: '120',
        actual: '120'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'n = 0',
        expected: '1',
        actual: '1'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'n = 3',
        expected: '6',
        actual: '6'
      }
    ],
    boilerplates: {
      python: `def factorial(n: int) -> int:
    # Return n! where 0! = 1
    return 1

# Test Run
print(factorial(5))`,
      cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    long long res = 1;
    for (int i = 2; i <= n; i++) res *= i;
    return res;
}

int main() {
    cout << factorial(5) << endl;
    return 0;
}`,
      java: `public class Main {
    public static long factorial(int n) {
        long res = 1;
        for (int i = 2; i <= n; i++) res *= i;
        return res;
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
      c: `#include <stdio.h>

long long factorial(int n) {
    long long res = 1;
    for (int i = 2; i <= n; i++) res *= i;
    return res;
}

int main() {
    printf("%lld\\n", factorial(5));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def factorial(n: int) -> int:
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print(factorial(5))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Iterative O(n) factorial without recursion overhead.'
      }
    ]
  },
  {
    id: 'py-palindrome-str',
    title: 'P8. Palindrome String Checker',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Strings', 'Two Pointers'],
    description:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing non-alphanumeric characters, it reads the same forward and backward.\n\nReturn `True` if `s` is a palindrome, or `False` otherwise.',
    examples: [
      {
        id: 1,
        input: 's = "racecar"',
        output: 'True',
        explanation: '"racecar" reads the same both ways.'
      },
      {
        id: 2,
        input: 's = "hello"',
        output: 'False',
        explanation: '"hello" is not a palindrome.'
      },
      {
        id: 3,
        input: 's = "A man a plan a canal Panama"',
        output: 'True',
        explanation: 'Ignoring spaces and case, it is a palindrome.'
      }
    ],
    constraints: ['1 <= len(s) <= 2 * 10^5'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 's = "racecar"',
        expected: 'True',
        actual: 'True'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 's = "hello"',
        expected: 'False',
        actual: 'False'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 's = "A man a plan a canal Panama"',
        expected: 'True',
        actual: 'True'
      }
    ],
    boilerplates: {
      python: `def is_palindrome(s: str) -> bool:
    # Check if s is palindrome ignoring non-alphanumeric characters
    return False

# Test Run
print(is_palindrome("racecar"))`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    int i = 0, j = (int)s.length() - 1;
    while (i < j) {
        while (i < j && !isalnum(s[i])) i++;
        while (i < j && !isalnum(s[j])) j--;
        if (tolower(s[i]) != tolower(s[j])) return false;
        i++; j--;
    }
    return true;
}

int main() {
    cout << (isPalindrome("racecar") ? "true" : "false") << endl;
    return 0;
}`,
      java: `public class Main {
    public static boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++; j--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

bool isPalindrome(const char* s) {
    int i = 0, j = strlen(s) - 1;
    while (i < j) {
        while (i < j && !isalnum(s[i])) i++;
        while (i < j && !isalnum(s[j])) j--;
        if (tolower(s[i]) != tolower(s[j])) return false;
        i++; j--;
    }
    return true;
}

int main() {
    printf("%s\\n", isPalindrome("racecar") ? "true" : "false");
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def is_palindrome(s: str) -> bool:
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]

print(is_palindrome("racecar"))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Linear O(n) normalization and reversal check.'
      }
    ]
  },
  {
    id: 'py-fibonacci',
    title: 'P9. N-th Fibonacci Number',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Math', 'Dynamic Programming'],
    description:
      'The Fibonacci numbers sequence starts with `F(0) = 0` and `F(1) = 1`. For `n > 1`, `F(n) = F(n - 1) + F(n - 2)`.\n\nGiven `n`, calculate and return `F(n)`.',
    examples: [
      {
        id: 1,
        input: 'n = 6',
        output: '8',
        explanation: 'F(6) = 8 (0, 1, 1, 2, 3, 5, 8).'
      },
      {
        id: 2,
        input: 'n = 2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.'
      },
      {
        id: 3,
        input: 'n = 4',
        output: '3',
        explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.'
      }
    ],
    constraints: ['0 <= n <= 30'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'n = 6',
        expected: '8',
        actual: '8'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'n = 2',
        expected: '1',
        actual: '1'
      },
      {
        id: 3,
        name: 'Case 3',
        input: 'n = 4',
        expected: '3',
        actual: '3'
      }
    ],
    boilerplates: {
      python: `def fib(n: int) -> int:
    # Return n-th Fibonacci number
    if n <= 1:
        return n
    return 0

# Test Run
print(fib(6))`,
      cpp: `#include <iostream>
using namespace std;

int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

int main() {
    cout << fib(6) << endl;
    return 0;
}`,
      java: `public class Main {
    public static int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }

    public static void main(String[] args) {
        System.out.println(fib(6));
    }
}`,
      c: `#include <stdio.h>

int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

int main() {
    printf("%d\\n", fib(6));
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def fib(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fib(6))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Optimal O(n) iterative Fibonacci with O(1) space.'
      }
    ]
  },
  {
    id: 'py-fizzbuzz',
    title: 'P10. FizzBuzz Classic',
    category: 'Python Basics',
    difficulty: 'Easy',
    companies: ['Beginner', 'Python Foundations'],
    tags: ['Python Basics', 'Conditionals', 'Simulation'],
    description:
      'Given an integer `n`, return a string list `answer` (1-indexed) where:\n- `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5.\n- `answer[i] == "Fizz"` if `i` is divisible by 3.\n- `answer[i] == "Buzz"` if `i` is divisible by 5.\n- `answer[i] == str(i)` if none of the above conditions are true.',
    examples: [
      {
        id: 1,
        input: 'n = 5',
        output: '["1", "2", "Fizz", "4", "Buzz"]',
        explanation: 'Numbers 1 to 5 with multiples of 3 and 5 substituted.'
      },
      {
        id: 2,
        input: 'n = 3',
        output: '["1", "2", "Fizz"]',
        explanation: '3 is replaced by Fizz.'
      }
    ],
    constraints: ['1 <= n <= 10^4'],
    testCases: [
      {
        id: 1,
        name: 'Case 1',
        input: 'n = 5',
        expected: '["1", "2", "Fizz", "4", "Buzz"]',
        actual: '["1", "2", "Fizz", "4", "Buzz"]'
      },
      {
        id: 2,
        name: 'Case 2',
        input: 'n = 3',
        expected: '["1", "2", "Fizz"]',
        actual: '["1", "2", "Fizz"]'
      }
    ],
    boilerplates: {
      python: `def fizz_buzz(n: int) -> list[str]:
    # Return FizzBuzz list from 1 to n
    return []

# Test Run
print(fizz_buzz(5))`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    vector<string> res;
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) res.push_back("FizzBuzz");
        else if (i % 3 == 0) res.push_back("Fizz");
        else if (i % 5 == 0) res.push_back("Buzz");
        else res.push_back(to_string(i));
    }
    return res;
}

int main() {
    vector<string> res = fizzBuzz(5);
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) {
        cout << "\\"" << res[i] << "\\"" << (i + 1 < res.size() ? ", " : "");
    }
    cout << "]" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static List<String> fizzBuzz(int n) {
        List<String> res = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) res.add("FizzBuzz");
            else if (i % 3 == 0) res.add("Fizz");
            else if (i % 5 == 0) res.add("Buzz");
            else res.add(String.valueOf(i));
        }
        return res;
    }

    public static void main(String[] args) {
        System.out.println(fizzBuzz(5));
    }
}`,
      c: `#include <stdio.h>

void fizzBuzz(int n) {
    printf("[");
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) printf("\\"FizzBuzz\\"");
        else if (i % 3 == 0) printf("\\"Fizz\\"");
        else if (i % 5 == 0) printf("\\"Buzz\\"");
        else printf("\\"%d\\"", i);
        if (i < n) printf(", ");
    }
    printf("]\\n");
}

int main() {
    fizzBuzz(5);
    return 0;
}`
    },
    botSolutions: [
      {
        code: `def fizz_buzz(n: int) -> list[str]:
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res

print(fizz_buzz(5))`,
        language: 'python',
        score: 100,
        accuracy_score: 100,
        feedback: 'Classic O(n) simulation of FizzBuzz divisibility rules.'
      }
    ]
  }
];
