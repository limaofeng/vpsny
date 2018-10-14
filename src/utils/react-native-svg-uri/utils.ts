export const camelCase = (value: any) => value.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase());

export const camelCaseNodeName = ({ nodeName, nodeValue }: any) => ({ nodeName: camelCase(nodeName), nodeValue });

export const removePixelsFromNodeValue = ({ nodeName, nodeValue }: any) => ({
  nodeName,
  nodeValue: nodeValue.replace('px', '')
});

export const transformStyle = ({ nodeName, nodeValue, fillProp }: any) => {
  if (nodeName === 'style') {
    return nodeValue.split(';').reduce((acc: any, attribute: any) => {
      const [property, value] = attribute.split(':');
      if (property == '') return acc;
      else return { ...acc, [camelCase(property)]: fillProp && property === 'fill' ? fillProp : value };
    }, {});
  }
  return null;
};

export const getEnabledAttributes = (enabledAttributes: any) => ({ nodeName }: any) =>
  enabledAttributes.includes(camelCase(nodeName));
