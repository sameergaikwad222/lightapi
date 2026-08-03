import useRequestStore from "../../store/requestStore";
import Input from "../ui/Input/Input";

function AuthEditor() {
  const { auth, setAuth } = useRequestStore();

  return (
    <div className="request-editor">

      <div className="auth-group">
        <label>Authentication Type</label>

        <select
          value={auth.type}
          onChange={(e) =>
            setAuth({
              ...auth,
              type: e.target.value,
            })
          }
        >
          <option value="none">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apikey">API Key</option>
        </select>
      </div>

      {auth.type === "bearer" && (
        <div className="auth-group">
          <label>Bearer Token</label>

          <Input
            placeholder="Enter token"
            value={auth.token}
            onChange={(e) =>
              setAuth({
                ...auth,
                token: e.target.value,
              })
            }
          />
        </div>
      )}

      {auth.type === "basic" && (
        <>
          <div className="auth-group">
            <label>Username</label>

            <Input
              value={auth.username}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  username: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-group">
            <label>Password</label>

            <Input
              type="password"
              value={auth.password}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  password: e.target.value,
                })
              }
            />
          </div>
        </>
      )}

      {auth.type === "apikey" && (
        <>
          <div className="auth-group">
            <label>Location</label>

            <select
              value={auth.apiLocation}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  apiLocation: e.target.value,
                })
              }
            >
              <option value="header">Header</option>
              <option value="query">Query Param</option>
            </select>
          </div>

          <div className="auth-group">
            <label>Key</label>

            <Input
              value={auth.apiKey}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  apiKey: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-group">
            <label>Value</label>

            <Input
              value={auth.apiValue}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  apiValue: e.target.value,
                })
              }
            />
          </div>
        </>
      )}

    </div>
  );
}

export default AuthEditor;