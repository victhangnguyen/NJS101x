export function matchRuleShort(str: string, rule: string) {
  var escapeRegex = (str: string) =>
    str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  return new RegExp(
    '^' + rule.split('*').map(escapeRegex).join('.*') + '$'
  ).test(str);
}

//Explanation code
export function matchRuleExpl(str: string, rule: string) {
  // for this solution to work on any string, no matter what characters it has
  var escapeRegex = (str: string) =>
    str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');

  // "."  => Find a single character, except newline or line terminator
  // ".*" => Matches any string that contains zero or more characters
  rule = rule.split('*').map(escapeRegex).join('.*');

  // "^"  => Matches any string with the following at the beginning of it
  // "$"  => Matches any string with that in front at the end of it
  rule = '^' + rule + '$';

  //Create a regular expression object for matching string
  var regex = new RegExp(rule);

  //Returns true if it finds a match, otherwise it returns false
  return regex.test(str);
}

export function matchRule(first: string, searchText: string): boolean {
  if (searchText === '*' || searchText === '') return true;

  if (first.length == 0 && searchText.length == 0) return true;

  if (first.length > 1 && first[0] == '*' && searchText.length == 0)
    return false;

  if (
    (first.length > 1 && first[0] == '?') ||
    (first.length != 0 && searchText.length != 0 && first[0] == searchText[0])
  )
    return matchRule(first.substring(1), searchText.substring(1));

  if (first.length > 0 && first[0] == '*')
    return (
      matchRule(first.substring(1), searchText) ||
      matchRule(first, searchText.substring(1))
    );

  return false;
}
