package gino;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public final class ConverterToJS {

  public static Object convert(Scriptable scope, Object obj) {
    return new ConverterToJS(scope).convertObject(obj);
  }

  private final Scriptable scope;
  private boolean excludeAllFunctions = false;
  private Set<Object> excludeMembers = null;

  public ConverterToJS(Scriptable scope) {
    this.scope = scope;
  }

  private boolean acceptElem(Object elem) {
    if (excludeMembers != null && excludeMembers.contains(elem))
      return false;
    if (excludeAllFunctions && elem instanceof Function)
      return false;
    return true;
  }

  @SuppressWarnings("unchecked")
  public Object convertObject(Object obj) {
    if (obj == null || obj instanceof Scriptable)
      return obj;
    if (obj instanceof Number || obj instanceof String || obj instanceof Boolean)
      return Context.javaToJS(obj, scope);
    if (obj instanceof Character) {
      char ch = (Character) obj;
      return Context.javaToJS(String.valueOf(ch), scope);
    }
    if (obj instanceof Object[]) {
      Object[] sourceArr = (Object[]) obj;
      NativeArray nativeArr = new NativeArray(sourceArr.length);
      for (int i = 0; i < sourceArr.length; i++) {
        Object convertedElem = convertObject(sourceArr[i]);
        if (acceptElem(convertedElem))
          nativeArr.put(i, nativeArr, convertedElem);
      }
      return nativeArr;
    }
    if (obj instanceof Collection<?>) {
      Collection<Object> sourceColl = (Collection<Object>) obj;
      NativeArray nativeArr = new NativeArray(sourceColl.size());
      int i = 0;
      for (Object elem : sourceColl) {
        Object convertedElem = convertObject(elem);
        if (acceptElem(convertedElem))
          nativeArr.put(i++, nativeArr, convertedElem);
      }
      return nativeArr;
    }
    if (obj instanceof Map<?, ?>) {
      Map<Object, Object> sourceMap = (Map<Object, Object>) obj;
      ScriptableObject nativeObj = new NativeObject();
      nativeObj.setParentScope(scope);
      nativeObj.setPrototype(ScriptableObject.getObjectPrototype(scope));
      for (Map.Entry<Object, Object> entry : sourceMap.entrySet()) {
        String key = entry.getKey().toString();
        if (acceptElem(key))
          nativeObj.put(key, nativeObj, convertObject(entry.getValue()));
      }
      return nativeObj;
    }
    return obj;
  }

  public Set<Object> getExcludeMembers() {
    return excludeMembers;
  }

  public boolean isExcludeAllFunctions() {
    return excludeAllFunctions;
  }

  public void setExcludeAllFunctions(boolean excludeAllFunctions) {
    this.excludeAllFunctions = excludeAllFunctions;
  }

  public void setExcludeMembers(Object... excludeMembers) {
    this.excludeMembers = new HashSet<Object>();
    if (excludeMembers != null)
      for (Object elem : excludeMembers)
        this.excludeMembers.add(elem);
  }

  public void setExcludeMembers(Set<Object> excludeMembers) {
    this.excludeMembers = excludeMembers;
  }
}
